import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const API_DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 2600);

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const MARKET = String(config.market || 'DE').toUpperCase();
const CURRENCY = String(config.currency || 'EUR').toUpperCase();
const ALLOWED_EUROPE = new Set((config.warehouseCountries || []).map((v) => String(v).toUpperCase()));
const MIN_STOCK = Math.max(1, Number(config.minStock || 1));
const PAGE_SIZE = Math.min(100, Math.max(1, Number(config.searchPageSize || 100)));
const MAX_PAGES = Math.min(60, Math.max(1, Number(config.maxDiscoveryPagesPerWarehouse || 60)));

const EU_MEMBERS = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'
]);

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
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid CJ JSON response (${response.status}) for ${new URL(url).pathname}`);
      }

      const message = String(payload?.message || '');
      const rateLimited = response.status === 429 || /too many requests|qps/i.test(message);
      if (rateLimited && attempt < maxAttempts) {
        lastCompletedAt = Date.now();
        await wait(3500 * attempt);
        continue;
      }

      if (!response.ok || payload?.result === false || payload?.success === false) {
        throw new Error(`CJ API error for ${new URL(url).pathname}: ${message || `HTTP ${response.status}`}`);
      }
      return payload;
    } finally {
      lastCompletedAt = Date.now();
    }
  }
  throw new Error(`CJ API request failed after ${maxAttempts} attempts: ${new URL(url).pathname}`);
}

async function getAccessToken() {
  const payload = await requestJson(`${API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY })
  });
  const token = payload?.data?.accessToken;
  if (!token) throw new Error('CJ did not return an access token.');
  return token;
}

async function cjGet(token, pathname, params = {}) {
  const url = new URL(`${API_BASE}${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, String(item)));
    else url.searchParams.set(key, String(value));
  }
  return requestJson(url, { headers: { 'CJ-Access-Token': token, Accept: 'application/json' } });
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseProductsV2(payload) {
  const content = Array.isArray(payload?.data?.content) ? payload.data.content : [];
  return content.flatMap((bucket) => Array.isArray(bucket?.productList) ? bucket.productList : []);
}

function parsePriceRange(...values) {
  for (const value of values) {
    const numbers = String(value ?? '').match(/\d+(?:\.\d+)?/g)?.map(Number).filter((n) => Number.isFinite(n) && n > 0) || [];
    if (numbers.length) return { min: Math.min(...numbers), max: Math.max(...numbers), raw: String(value) };
  }
  return null;
}

function roundRetail(value) {
  if (!(value > 0)) return null;
  if (value < 10) return Number((Math.ceil(value * 2) / 2 - 0.01).toFixed(2));
  if (value < 25) return Number(`${Math.floor(value)}.90`);
  return Number(`${Math.floor(value)}.99`);
}

function riskFlags(raw) {
  const text = `${raw?.nameEn || ''} ${raw?.oneCategoryName || ''} ${raw?.twoCategoryName || ''} ${raw?.threeCategoryName || ''} ${stripHtml(raw?.description)}`.toLowerCase();
  const flags = [];
  if (/makeup|cosmetic|lipstick|lip gloss|foundation|mascara|concealer|blush|eyeshadow|skin care|skincare|serum|lotion/.test(text)) flags.push('cosmetics');
  if (/medical|therapy|arthritis|pain relief|rehabilitation|treatment|healing|injury prevention/.test(text)) flags.push('health-claims');
  if (/battery|lithium|charger|power bank|bluetooth|wifi|electronic|electric/.test(text)) flags.push('electronics-or-battery');
  if (/baby|infant|toddler/.test(text)) flags.push('child-product');
  return flags;
}

function scoreProduct(raw, stock, priceMaxEur, flags) {
  let score = 0;
  score += Math.min(35, Math.log10(Math.max(1, stock)) * 11);
  score += Math.min(30, Math.log10(Math.max(1, Number(raw?.listedNum || 0)) + 1) * 9);
  if (Number(raw?.isVideo) === 1) score += 10;
  if (priceMaxEur >= 2 && priceMaxEur <= 12) score += 12;
  score -= flags.length * 18;
  return Number(score.toFixed(2));
}

async function getUsdToEurRate() {
  const override = Number(process.env.USD_TO_EUR_RATE || 0);
  if (override > 0) return { rate: override, source: 'env' };

  const response = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
    headers: { Accept: 'application/xml,text/xml' }
  });
  if (!response.ok) throw new Error(`ECB FX request failed with HTTP ${response.status}.`);
  const xml = await response.text();
  const match = xml.match(/currency=['"]USD['"]\s+rate=['"]([0-9.]+)['"]/i);
  const usdPerEur = Number(match?.[1] || 0);
  if (!(usdPerEur > 0)) throw new Error('Could not parse USD reference rate from ECB.');
  return { rate: 1 / usdPerEur, source: 'ecb' };
}

console.log('Authenticating with CJ...');
const token = await getAccessToken();
const fx = await getUsdToEurRate();

const warehousePayload = await cjGet(token, '/product/globalWarehouseList');
const globalWarehouses = Array.isArray(warehousePayload?.data) ? warehousePayload.data : [];
const activeEuropeanWarehouses = globalWarehouses
  .filter((w) => w?.disabled !== true)
  .map((w) => ({
    countryCode: String(w?.countryCode || '').toUpperCase(),
    areaEn: String(w?.areaEn || w?.en || w?.nameEn || w?.countryCode || 'Warehouse'),
    areaId: w?.areaId ?? null,
    id: w?.id ?? null
  }))
  .filter((w) => ALLOWED_EUROPE.has(w.countryCode));

if (!activeEuropeanWarehouses.length) {
  throw new Error('CJ globalWarehouseList returned no active warehouses matching the configured Europe region.');
}

console.log(`Active CJ Europe warehouses: ${activeEuropeanWarehouses.map((w) => w.countryCode).join(', ')}`);

const productMap = new Map();
const discoveryStats = {};

for (const warehouse of activeEuropeanWarehouses) {
  const countryCode = warehouse.countryCode;
  let page = 1;
  let totalPages = 1;
  let totalRecords = 0;
  let fetched = 0;

  do {
    console.log(`CJ Europe discovery ${countryCode}: page ${page}`);
    const payload = await cjGet(token, '/product/listV2', {
      page,
      size: PAGE_SIZE,
      countryCode,
      startWarehouseInventory: MIN_STOCK,
      verifiedWarehouse: 1,
      isWarehouse: true,
      orderBy: 4,
      sort: 'desc',
      features: ['enable_description', 'enable_category', 'enable_video']
    });

    totalPages = Math.max(1, Number(payload?.data?.totalPages || 1));
    totalRecords = Number(payload?.data?.totalRecords || 0);
    const rows = parseProductsV2(payload);
    fetched += rows.length;

    for (const raw of rows) {
      if (!raw?.id) continue;
      const stock = Math.max(0, Number(raw?.warehouseInventoryNum || 0));
      if (stock < MIN_STOCK) continue;

      const priceRange = parsePriceRange(raw?.nowPrice, raw?.discountPrice, raw?.sellPrice);
      if (!priceRange) continue;

      const id = String(raw.id);
      const existing = productMap.get(id);
      if (!existing) {
        productMap.set(id, {
          raw,
          priceRange,
          warehouses: new Map([[countryCode, stock]])
        });
      } else {
        existing.warehouses.set(countryCode, Math.max(existing.warehouses.get(countryCode) || 0, stock));
        if (Number(raw?.listedNum || 0) > Number(existing.raw?.listedNum || 0)) existing.raw = raw;
        existing.priceRange = {
          min: Math.min(existing.priceRange.min, priceRange.min),
          max: Math.max(existing.priceRange.max, priceRange.max),
          raw: existing.priceRange.raw
        };
      }
    }

    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);

  discoveryStats[countryCode] = {
    totalRecords,
    totalPages,
    pagesFetched: Math.min(totalPages, MAX_PAGES),
    fetched
  };
}

const products = [...productMap.entries()].map(([id, entry]) => {
  const raw = entry.raw;
  const warehouses = [...entry.warehouses.entries()]
    .map(([countryCode, stock]) => {
      const meta = activeEuropeanWarehouses.find((w) => w.countryCode === countryCode);
      return {
        countryCode,
        areaEn: meta?.areaEn || `${countryCode} Warehouse`,
        stock,
        verified: true,
        euMember: EU_MEMBERS.has(countryCode),
        customsRiskToGermany: !EU_MEMBERS.has(countryCode)
      };
    })
    .sort((a, b) => b.stock - a.stock || a.countryCode.localeCompare(b.countryCode));

  const stock = warehouses.reduce((sum, w) => sum + w.stock, 0);
  const primaryWarehouse = warehouses[0]?.countryCode || null;
  const sourceCostMin = entry.priceRange.min;
  const sourceCostMax = entry.priceRange.max;
  const costMinEur = sourceCostMin * fx.rate;
  const costMaxEur = sourceCostMax * fx.rate;
  const target = Math.max(
    Number(config.targetRetailMin || 14.9),
    costMaxEur * Number(config.markupMultiplier || 2.3),
    costMaxEur + Number(config.minimumGrossProfit || 8)
  );
  const price = roundRetail(target);
  const flags = riskFlags(raw);
  const name = stripHtml(raw?.nameEn || raw?.sku || id);
  const description = stripHtml(raw?.description || '').slice(0, 900);
  const category = stripHtml(raw?.threeCategoryName || raw?.twoCategoryName || raw?.oneCategoryName || 'CJ Product');
  const images = [raw?.bigImage].filter((v) => typeof v === 'string' && /^https:\/\//i.test(v));

  return {
    id,
    sku: String(raw?.sku || raw?.spu || id),
    brand: 'Virello Select',
    name: { de: name, en: name },
    description: { de: description, en: description },
    category: { de: category, en: category },
    price,
    compareAt: null,
    cost: Number(costMaxEur.toFixed(2)),
    costRange: { min: Number(costMinEur.toFixed(2)), max: Number(costMaxEur.toFixed(2)), currency: 'EUR' },
    sourceCost: Number(sourceCostMax.toFixed(2)),
    sourceCostRange: { min: Number(sourceCostMin.toFixed(2)), max: Number(sourceCostMax.toFixed(2)), raw: entry.priceRange.raw },
    sourceCurrency: 'USD',
    stock,
    warehouses,
    primaryWarehouse,
    verifiedStock: true,
    stockVerificationMethod: 'CJ Product List V2: countryCode + verifiedWarehouse=1 + warehouseInventoryNum',
    variantStock: [],
    images,
    supplier: 'CJdropshipping',
    source: 'cj',
    market: MARKET,
    currency: CURRENCY,
    listedNum: Number(raw?.listedNum || 0),
    deliveryCycle: raw?.deliveryCycle || null,
    directMinOrderNum: raw?.directMinOrderNum == null || raw?.directMinOrderNum === '' ? null : Number(raw.directMinOrderNum),
    complianceSignals: {
      ce: raw?.hasCECertification == null ? null : Number(raw.hasCECertification) === 1,
      riskFlags: flags
    },
    hasVideo: Number(raw?.isVideo) === 1,
    videoList: Array.isArray(raw?.videoList) ? raw.videoList : [],
    adCandidate: false,
    score: scoreProduct(raw, stock, costMaxEur, flags),
    sellReady: false,
    sellReadyReason: 'CJ verified European warehouse inventory is present. Germany delivery cost/time, variant-level stock, payment, legal and product-specific compliance must still be verified before checkout.'
  };
});

products.sort((a, b) => {
  const aRisk = a.complianceSignals.riskFlags.length;
  const bRisk = b.complianceSignals.riskFlags.length;
  return aRisk - bRisk || b.score - a.score || b.stock - a.stock || b.listedNum - a.listedNum;
});

let adSlots = Number(config.maxAdCandidates || 6);
for (const product of products) {
  if (adSlots <= 0) break;
  if (product.complianceSignals.riskFlags.length === 0) {
    product.adCandidate = true;
    adSlots -= 1;
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: products.length ? 'live-api-europe' : 'live-api-empty',
  selection: {
    market: MARKET,
    warehouseRegion: 'EUROPE',
    configuredWarehouseCountries: [...ALLOWED_EUROPE],
    activeWarehouseCountries: activeEuropeanWarehouses.map((w) => w.countryCode),
    activeWarehouses: activeEuropeanWarehouses,
    verifiedWarehouseOnly: true,
    minStock: MIN_STOCK,
    productCount: products.length,
    discoveryStats,
    exchangeRate: { usdToEur: Number(fx.rate.toFixed(6)), source: fx.source },
    note: 'No Germany warehouse priority. Every active CJ warehouse in the configured European region is searched. Product List V2 is paginated and restricted to verified inventory. Non-EU European warehouses are retained but flagged for Germany customs risk. All products remain sellReady=false until delivery, variant stock and compliance checks are completed.'
  },
  products
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${products.length} CJ verified European-warehouse products.`);
