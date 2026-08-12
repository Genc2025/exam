import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PRODUCTS_PATH = path.join(ROOT, 'data', 'products.json');
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const API_DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 2600);

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const feed = JSON.parse(await fs.readFile(PRODUCTS_PATH, 'utf8'));

const DEMO_DESTINATION = String(config.demoDestinationCountry || 'DE').toUpperCase();
const DEMO_ZIP = String(config.demoDestinationZip || '10115');
const VAT_RATE = Number(config.demoVatRate ?? 0.19);
const PAYMENT_FEE_RATE = Number(config.demoPaymentFeeRate ?? 0.03);
const TARGET_PRE_AD_MARGIN = Number(config.demoTargetPreAdMargin ?? 0.30);
const MAX_PRODUCTS = Number(config.maxEconomicsProducts || 500);
const fxRate = Number(feed?.selection?.exchangeRate?.usdToEur || 0);
if (!(fxRate > 0)) throw new Error('USD→EUR exchange rate missing from products feed.');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastCompletedAt = 0;

async function requestJson(url, options = {}) {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const elapsed = Date.now() - lastCompletedAt;
    if (lastCompletedAt && elapsed < API_DELAY_MS) await wait(API_DELAY_MS - elapsed);

    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let payload;
      try { payload = text ? JSON.parse(text) : {}; }
      catch { throw new Error(`Invalid CJ JSON response (${response.status})`); }

      const message = String(payload?.message || '');
      const rateLimited = response.status === 429 || /too many requests|qps/i.test(message);
      if (rateLimited && attempt < maxAttempts) {
        lastCompletedAt = Date.now();
        await wait(4000 * attempt);
        continue;
      }

      if (!response.ok || payload?.result === false || payload?.success === false) {
        throw new Error(message || `HTTP ${response.status}`);
      }
      return payload;
    } finally {
      lastCompletedAt = Date.now();
    }
  }
  throw new Error('CJ request failed after retries.');
}

async function getAccessToken() {
  const payload = await requestJson(`${API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY })
  });
  if (!payload?.data?.accessToken) throw new Error('CJ access token missing.');
  return payload.data.accessToken;
}

async function cjGet(token, pathname, params = {}) {
  const url = new URL(`${API_BASE}${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return requestJson(url, { headers: { 'CJ-Access-Token': token, Accept: 'application/json' } });
}

async function cjPost(token, pathname, body) {
  return requestJson(`${API_BASE}${pathname}`, {
    method: 'POST',
    headers: {
      'CJ-Access-Token': token,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });
}

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function roundRetail(value) {
  if (!(value > 0)) return null;
  if (value < 10) return Number((Math.ceil(value * 2) / 2 - 0.01).toFixed(2));
  if (value < 25) return Number(`${Math.ceil(value)}.90`);
  return Number(`${Math.ceil(value)}.99`);
}

function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function selectRepresentativeVariant(details) {
  const variants = Array.isArray(details?.variants) ? details.variants : [];
  const candidates = variants
    .filter((variant) => variant?.vid && positive(variant?.variantSellPrice))
    .sort((a, b) => Number(b.variantSellPrice) - Number(a.variantSellPrice));
  return candidates[0] || null;
}

function shippingTotalUsd(option) {
  return positive(option?.totalPostageFee)
    ?? positive(option?.logisticPrice)
    ?? positive(option?.postage)
    ?? positive(option?.discountFee)
    ?? null;
}

function chooseShipping(options) {
  return (Array.isArray(options) ? options : [])
    .map((option) => ({ option, totalUsd: shippingTotalUsd(option) }))
    .filter((row) => row.totalUsd != null)
    .sort((a, b) => a.totalUsd - b.totalUsd)[0] || null;
}

function maxSuggestedRetailUsd(details) {
  const values = String(details?.suggestSellPrice ?? '')
    .match(/\d+(?:\.\d+)?/g)?.map(Number).filter((n) => n > 0) || [];
  return values.length ? Math.max(...values) : null;
}

const token = await getAccessToken();
const products = Array.isArray(feed.products) ? feed.products : [];
let processed = 0;
let freightVerified = 0;

for (const product of products) {
  if (processed >= MAX_PRODUCTS) break;
  processed += 1;

  const origin = String(product.primaryWarehouse || '').toUpperCase();
  if (!origin || !product.id) {
    product.economics = { status: 'unavailable', reason: 'Missing product id or warehouse origin.' };
    continue;
  }

  try {
    const detailPayload = await cjGet(token, '/product/query', {
      pid: product.id,
      countryCode: origin
    });
    const details = detailPayload?.data || null;
    const variant = selectRepresentativeVariant(details);

    if (!variant?.vid) {
      product.economics = {
        status: 'unavailable',
        reason: 'CJ returned no in-country variant suitable for freight calculation.',
        destinationCountry: DEMO_DESTINATION,
        destinationZip: DEMO_ZIP
      };
      continue;
    }

    let shippingSelection = null;
    let shippingError = null;
    try {
      const freightPayload = await cjPost(token, '/logistic/freightCalculate', {
        startCountryCode: origin,
        endCountryCode: DEMO_DESTINATION,
        zip: DEMO_ZIP,
        products: [{ quantity: 1, vid: variant.vid }]
      });
      shippingSelection = chooseShipping(freightPayload?.data);
      if (!shippingSelection) shippingError = 'CJ returned no priced logistics option.';
    } catch (error) {
      shippingError = error.message;
    }

    const productCostUsd = positive(variant.variantSellPrice) ?? positive(product.sourceCost) ?? 0;
    const productCostEur = productCostUsd * fxRate;
    const cjSuggestedUsd = maxSuggestedRetailUsd(details);
    const cjSuggestedEur = cjSuggestedUsd ? cjSuggestedUsd * fxRate : null;

    if (!shippingSelection) {
      product.economics = {
        status: 'partial',
        destinationCountry: DEMO_DESTINATION,
        destinationZip: DEMO_ZIP,
        originCountry: origin,
        representativeVariant: {
          strategy: 'highest supplier price among variants returned for the warehouse country',
          vid: String(variant.vid),
          sku: variant.variantSku || null,
          name: variant.variantNameEn || variant.variantKey || null,
          supplierCostUsd: roundMoney(productCostUsd),
          supplierCostEur: roundMoney(productCostEur)
        },
        cjSuggestedRetailEur: cjSuggestedEur ? roundMoney(cjSuggestedEur) : null,
        freight: { status: 'unavailable', reason: shippingError || 'No freight price returned.' },
        assumptions: {
          vatRate: VAT_RATE,
          paymentFeeRate: PAYMENT_FEE_RATE,
          targetPreAdMargin: TARGET_PRE_AD_MARGIN
        }
      };
      continue;
    }

    const shipping = shippingSelection.option;
    const shippingUsd = shippingSelection.totalUsd;
    const shippingEur = shippingUsd * fxRate;
    const landedCostEur = productCostEur + shippingEur;

    // Conservative demo retail: enough room for DE VAT reserve, payment fee and target pre-ad contribution.
    const netRevenueFactor = (1 / (1 + VAT_RATE)) - PAYMENT_FEE_RATE - TARGET_PRE_AD_MARGIN;
    const floorFromEconomics = netRevenueFactor > 0 ? landedCostEur / netRevenueFactor : landedCostEur * 2.3;
    const floorFromCjSuggestion = cjSuggestedEur || 0;
    const suggestedRetail = roundRetail(Math.max(14.9, floorFromEconomics, floorFromCjSuggestion));

    const vatReserve = suggestedRetail - (suggestedRetail / (1 + VAT_RATE));
    const paymentFee = suggestedRetail * PAYMENT_FEE_RATE;
    const netRevenueExVat = suggestedRetail / (1 + VAT_RATE);
    const preAdProfit = netRevenueExVat - paymentFee - landedCostEur;
    const preAdMargin = suggestedRetail > 0 ? preAdProfit / suggestedRetail : 0;

    product.price = roundMoney(suggestedRetail);
    product.economics = {
      status: 'freight-verified-demo',
      destinationCountry: DEMO_DESTINATION,
      destinationZip: DEMO_ZIP,
      originCountry: origin,
      representativeVariant: {
        strategy: 'highest supplier price among variants returned for the warehouse country',
        vid: String(variant.vid),
        sku: variant.variantSku || null,
        name: variant.variantNameEn || variant.variantKey || null,
        supplierCostUsd: roundMoney(productCostUsd),
        supplierCostEur: roundMoney(productCostEur)
      },
      freight: {
        status: 'verified-by-cj-api',
        logisticsName: shipping.logisticName || shipping?.option?.enName || null,
        deliveryDays: shipping.logisticAging || shipping.arrivalTime || null,
        shippingUsd: roundMoney(shippingUsd),
        shippingEur: roundMoney(shippingEur),
        taxesFeeUsd: roundMoney(shipping.taxesFee || 0),
        clearanceOperationFeeUsd: roundMoney(shipping.clearanceOperationFee || 0),
        tariffUsd: roundMoney(shipping.tariff || 0),
        sourceField: positive(shipping.totalPostageFee) ? 'totalPostageFee' : 'logisticPrice'
      },
      landedCostEur: roundMoney(landedCostEur),
      cjSuggestedRetailEur: cjSuggestedEur ? roundMoney(cjSuggestedEur) : null,
      suggestedSellingPriceEur: roundMoney(suggestedRetail),
      vatReserveEur: roundMoney(vatReserve),
      paymentFeeReserveEur: roundMoney(paymentFee),
      estimatedProfitBeforeAdsEur: roundMoney(preAdProfit),
      estimatedPreAdMargin: Number(preAdMargin.toFixed(4)),
      breakEvenAdSpendEur: roundMoney(Math.max(0, preAdProfit)),
      marketValidatedCompetitivePrice: false,
      assumptions: {
        vatRate: VAT_RATE,
        vatLabel: 'Germany demo reserve; actual VAT treatment depends on seller/import/IOSS setup',
        paymentFeeRate: PAYMENT_FEE_RATE,
        paymentFeeLabel: 'Demo reserve until the real gateway tariff is connected',
        targetPreAdMargin: TARGET_PRE_AD_MARGIN,
        quantity: 1
      }
    };
    freightVerified += 1;
  } catch (error) {
    product.economics = {
      status: 'unavailable',
      reason: error.message,
      destinationCountry: DEMO_DESTINATION,
      destinationZip: DEMO_ZIP
    };
  }
}

feed.economicsGeneratedAt = new Date().toISOString();
feed.economicsSummary = {
  processed,
  freightVerified,
  destinationCountry: DEMO_DESTINATION,
  destinationZip: DEMO_ZIP,
  vatRate: VAT_RATE,
  paymentFeeRate: PAYMENT_FEE_RATE,
  targetPreAdMargin: TARGET_PRE_AD_MARGIN,
  note: 'Demo economics. Freight is sourced from CJ freightCalculate for one representative in-country variant. Suggested retail is a cost-based target, not a market-validated competitive price. Profit is before advertising and returns.'
};

await fs.writeFile(PRODUCTS_PATH, `${JSON.stringify(feed, null, 2)}\n`);
console.log(`Economics enriched: ${freightVerified}/${processed} products with CJ freight.`);
