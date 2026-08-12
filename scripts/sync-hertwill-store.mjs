import fs from 'node:fs/promises';

const API = 'https://api.hertwill.com';
const API_KEY = process.env.HERTWILL_API_KEY;
if (!API_KEY) throw new Error('HERTWILL_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile('data/hertwill-config.json', 'utf8'));
const MARKET = String(config.market || 'DE').toUpperCase();
const VAT_RATE = Number(config.vatReserveRate ?? 0.19);
const PAYMENT_RATE = Number(config.paymentFeeReserveRate ?? 0.03);
const TARGET_PROFIT = Number(config.targetProfitBeforeAdsEur ?? 15);

const num = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const text = (value) => String(value ?? '').trim();
const stripHtml = (value) => text(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const unwrap = (payload) => payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
  ? payload.data
  : payload;

async function getJson(path) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  });
  const body = await response.text();
  let payload;
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    throw new Error(`Invalid JSON (${response.status}) from ${path}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${path}: ${payload?.message || body.slice(0, 200)}`);
  }
  return payload;
}

function rowsFrom(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function collectImages(product) {
  const values = [];
  const add = (value) => {
    if (typeof value === 'string' && /^https:\/\//i.test(value)) values.push(value);
    else if (value && typeof value === 'object') {
      for (const key of ['src', 'url', 'image_url', 'original', 'large']) add(value[key]);
    }
  };
  add(product.image);
  add(product.image_url);
  add(product.thumbnail);
  if (Array.isArray(product.images)) product.images.forEach(add);
  return [...new Set(values)].slice(0, 10);
}

function attractivePrice(raw) {
  if (!(raw > 0)) return null;
  const ending = raw < 40 ? 0.10 : 0.01;
  let candidate = Math.ceil(raw) - ending;
  if (candidate < raw) candidate += 1;
  return Number(candidate.toFixed(2));
}

async function getGermanyShipping(brandId, originCountryCode) {
  if (!brandId) return null;
  const payload = await getJson(`/v1/brands/${encodeURIComponent(brandId)}/shipping-price-lists`);
  const rows = rowsFrom(payload).flatMap((list) => (list.shipping_prices || [])
    .filter((row) => text(row?.dest_iso_code).toUpperCase() === MARKET)
    .map((row) => ({ listId: list.id, listName: list.name, ...row })));
  if (!rows.length) return null;
  return rows.find((row) => text(row.origin_iso_code).toUpperCase() === originCountryCode) || rows[0];
}

function representativeSupplierCost(product) {
  const variations = Array.isArray(product.variations) ? product.variations : [];
  const inStockVariationPrices = variations
    .filter((variation) => (num(variation.stock) ?? 0) > 0 || text(variation.stock_status).toLowerCase() === 'instock')
    .flatMap((variation) => [variation.sale_price, variation.price])
    .map(num)
    .filter((value) => value != null && value > 0);

  // Use the highest in-stock variant cost so the demo margin is not overstated.
  if (inStockVariationPrices.length) return Math.max(...inStockVariationPrices);

  const basePrices = [product.sale_price, product.price]
    .map(num)
    .filter((value) => value != null && value > 0);
  return basePrices.length ? Math.max(...basePrices) : null;
}

const syncedProducts = [];
for (const selected of config.selectedProducts || []) {
  const product = unwrap(await getJson(`/v1/products/${encodeURIComponent(selected.id)}`)) || {};
  const brandId = product?.brand?.id ?? product?.brand_id ?? null;
  const originCountryCode = text(product?.brand?.shipping_origin_iso_code || product?.shipping_origin_iso_code).toUpperCase();
  const shipping = await getGermanyShipping(brandId, originCountryCode);
  const supplierCost = representativeSupplierCost(product);
  const shippingCost = num(shipping?.price);
  const stock = num(product.stock) ?? 0;

  let economics = null;
  let sellingPrice = null;
  if (supplierCost != null && shippingCost != null) {
    const landed = supplierCost + shippingCost;
    const revenueFactor = (1 / (1 + VAT_RATE)) - PAYMENT_RATE;
    if (revenueFactor <= 0) throw new Error('Invalid VAT/payment assumptions.');
    sellingPrice = attractivePrice((landed + TARGET_PROFIT) / revenueFactor);
    const vatReserve = sellingPrice - (sellingPrice / (1 + VAT_RATE));
    const paymentReserve = sellingPrice * PAYMENT_RATE;
    const profitBeforeAds = (sellingPrice / (1 + VAT_RATE)) - paymentReserve - landed;
    economics = {
      status: 'freight-verified-demo',
      destinationCountry: MARKET,
      originCountry: originCountryCode || null,
      representativeVariant: {
        strategy: 'highest in-stock Hertwill variant price; base price when no variants',
        supplierCostEur: Number(supplierCost.toFixed(2))
      },
      freight: {
        status: 'verified',
        shippingEur: Number(shippingCost.toFixed(2)),
        logisticsName: 'Hertwill EU shipping',
        shippingPriceList: shipping?.listName || null
      },
      landedCostEur: Number(landed.toFixed(2)),
      suggestedSellingPriceEur: sellingPrice,
      vatReserveEur: Number(vatReserve.toFixed(2)),
      paymentFeeReserveEur: Number(paymentReserve.toFixed(2)),
      estimatedProfitBeforeAdsEur: Number(profitBeforeAds.toFixed(2)),
      breakEvenAdSpendEur: Number(Math.max(0, profitBeforeAds).toFixed(2)),
      marketValidatedCompetitivePrice: selected.marketValidatedCompetitivePrice === true,
      assumptions: {
        vatRate: VAT_RATE,
        paymentFeeRate: PAYMENT_RATE,
        targetProfitBeforeAdsEur: TARGET_PROFIT
      }
    };
  }

  const name = text(product.name) || `Hertwill Product ${selected.id}`;
  const description = stripHtml(product.description || product.short_description || 'Hertwill EU product.');
  const category = text(product?.category?.name || product?.category_name || 'General');
  const brand = text(product?.brand?.name || product?.brand_name || 'Hertwill');

  syncedProducts.push({
    id: `hertwill-${selected.id}`,
    supplierProductId: Number(selected.id),
    sku: product.sku || null,
    brand,
    name: { de: name, en: name },
    description: { de: description, en: description },
    category: { de: category, en: category },
    price: sellingPrice,
    compareAt: null,
    cost: supplierCost == null ? null : Number(supplierCost.toFixed(2)),
    stock,
    warehouses: originCountryCode ? [{
      countryCode: originCountryCode,
      areaEn: originCountryCode,
      stock,
      verified: stock > 0,
      euMember: true,
      customsRiskToGermany: false
    }] : [],
    primaryWarehouse: originCountryCode || null,
    verifiedStock: stock > 0,
    stockVerificationMethod: 'Hertwill authenticated API product stock',
    images: collectImages(product),
    supplier: 'Hertwill',
    source: 'hertwill',
    market: MARKET,
    currency: config.currency || 'EUR',
    adCandidate: selected.adCandidate === true,
    score: 0,
    sellReady: selected.sellReady === true && selected.marketValidatedCompetitivePrice === true && stock > 0 && Boolean(economics),
    sellReadyReason: selected.sellReady === true && selected.marketValidatedCompetitivePrice === true
      ? 'Configured for sale after authenticated Hertwill stock/economics sync.'
      : 'Research/demo only. Market competitiveness and final compliance approval are still required.',
    marketValidation: {
      status: selected.marketValidatedCompetitivePrice === true ? 'verified' : 'not-approved',
      reason: selected.marketNote || 'External market validation pending.'
    },
    economics
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  source: 'hertwill',
  mode: 'authenticated-api-demo',
  destination: MARKET,
  products: syncedProducts
};

await fs.writeFile('data/hertwill-products.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`Hertwill storefront sync complete: ${syncedProducts.length} products.`);
