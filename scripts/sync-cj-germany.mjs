import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const API_DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 2200);

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const MARKET = String(config.market || 'DE').toUpperCase();
const ALLOWED_WAREHOUSES = (config.warehouseCountries || ['DE']).map((code) => String(code).toUpperCase());
const WAREHOUSE_PRIORITY = (config.warehousePriority || ALLOWED_WAREHOUSES).map((code) => String(code).toUpperCase());
const ALLOWED_SET = new Set(ALLOWED_WAREHOUSES);
const COUNTRY_NAMES = {
  DE: 'Germany',
  PL: 'Poland',
  CZ: 'Czechia',
  NL: 'Netherlands',
  FR: 'France',
  ES: 'Spain'
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastApiCallAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastApiCallAt;
  if (elapsed < API_DELAY_MS) await wait(API_DELAY_MS - elapsed);
  lastApiCallAt = Date.now();
}

async function requestJson(url, options = {}) {
  await throttle();
  const response = await fetch(url, options);
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid CJ JSON response (${response.status}) for ${new URL(url).pathname}`);
  }
  if (!response.ok || payload?.result === false || payload?.success === false) {
    throw new Error(`CJ API error for ${new URL(url).pathname}: ${payload?.message || `HTTP ${response.status}`}`);
  }
  return payload;
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
  return requestJson(url, {
    headers: { 'CJ-Access-Token': token, Accept: 'application/json' }
  });
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

function containsAny(text, keywords = []) {
  const haystack = String(text || '').toLowerCase();
  return keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function parseProductsV2(payload) {
  const content = Array.isArray(payload?.data?.content) ? payload.data.content : [];
  return content.flatMap((bucket) => Array.isArray(bucket?.productList) ? bucket.productList : []);
}

function parseDeliveryMax(value) {
  const numbers = String(value || '').match(/\d+/g)?.map(Number) || [];
  return numbers.length ? Math.max(...numbers) : null;
}

function roundRetail(value) {
  if (!(value > 0)) return null;
  const whole = Math.floor(value);
  if (value < 10) return Number((Math.ceil(value * 2) / 2 - 0.01).toFixed(2));
  if (value < 25) return Number(`${whole}.90`);
  return Number(`${whole}.99`);
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

function normalizedText(raw) {
  return `${raw?.nameEn || ''} ${raw?.oneCategoryName || ''} ${raw?.twoCategoryName || ''} ${raw?.threeCategoryName || ''} ${stripHtml(raw?.description)}`.toLowerCase();
}

function warehouseRank(countryCode) {
  const index = WAREHOUSE_PRIORITY.indexOf(String(countryCode || '').toUpperCase());
  return index === -1 ? 999 : index;
}

async function getVerifiedEuStock(token, pid) {
  const payload = await cjGet(token, '/product/stock/getInventoryByPid', { pid });
  const variantInventories = Array.isArray(payload?.data?.variantInventories) ? payload.data.variantInventories : [];
  const variants = [];
  const byCountry = new Map();
  let total = 0;

  for (const variant of variantInventories) {
    const rows = Array.isArray(variant?.inventory) ? variant.inventory : [];
    const variantByCountry = new Map();
    let variantTotal = 0;

    for (const row of rows) {
      const countryCode = String(row?.countryCode || '').toUpperCase();
      if (!ALLOWED_SET.has(countryCode)) continue;
      if (Number(row?.verifiedWarehouse) !== 1) continue;

      const subWarehouseRows = Array.isArray(row?.stock) ? row.stock : [];
      const subWarehouseStock = subWarehouseRows.reduce(
        (sum, item) => sum + Math.max(0, Number(item?.inventory || 0)),
        0
      );
      const verifiedStock = subWarehouseStock || Math.max(0, Number(row?.cjInventory ?? row?.totalInventory ?? 0));
      if (!(verifiedStock > 0)) continue;

      variantByCountry.set(countryCode, (variantByCountry.get(countryCode) || 0) + verifiedStock);
      byCountry.set(countryCode, (byCountry.get(countryCode) || 0) + verifiedStock);
      variantTotal += verifiedStock;
      total += verifiedStock;
    }

    if (variantTotal > 0) {
      variants.push({
        vid: String(variant?.vid || ''),
        stock: variantTotal,
        warehouses: [...variantByCountry.entries()]
          .map(([countryCode, stock]) => ({ countryCode, stock }))
          .sort((a, b) => warehouseRank(a.countryCode) - warehouseRank(b.countryCode))
      });
    }
  }

  const warehouses = [...byCountry.entries()]
    .map(([countryCode, stock]) => ({
      countryCode,
      areaEn: `${COUNTRY_NAMES[countryCode] || countryCode} Warehouse`,
      stock,
      verified: true
    }))
    .sort((a, b) => warehouseRank(a.countryCode) - warehouseRank(b.countryCode));

  return {
    total,
    variants,
    warehouses,
    primaryWarehouse: warehouses[0]?.countryCode || null
  };
}

async function getProductDetails(token, pid) {
  const payload = await cjGet(token, '/product/query', { pid });
  return payload?.data || null;
}

function scoreProduct(raw, inventory, costEur) {
  let score = 0;
  const text = normalizedText(raw);
  const listed = Number(raw?.listedNum || 0);
  const deliveryMax = parseDeliveryMax(raw?.deliveryCycle);
  score += Math.min(30, Math.log10(Math.max(1, inventory.total)) * 10);
  score += Math.min(24, Math.log10(Math.max(1, listed) + 1) * 8);
  if (Number(raw?.isVideo) === 1) score += 10;
  if (containsAny(text, config.preferredCategoryKeywords || [])) score += 14;
  if (costEur >= 2 && costEur <= 10) score += 12;
  if (deliveryMax !== null && deliveryMax <= config.maxDeliveryDays) score += 8;
  const rank = warehouseRank(inventory.primaryWarehouse);
  if (rank === 0) score += 18;
  else if (rank === 1) score += 12;
  else if (rank === 2 || rank === 3) score += 8;
  else if (rank < 999) score += 4;
  return Number(score.toFixed(2));
}

function selectImages(raw, details) {
  const urls = [details?.bigImage, ...(details?.productImageSet || []), raw?.bigImage]
    .filter((value) => typeof value === 'string' && /^https:\/\//i.test(value));
  return [...new Set(urls)].slice(0, 8);
}

function buildProduct(raw, details, verifiedInventory, fxRate) {
  const costUsd = Number(raw?.nowPrice || raw?.discountPrice || raw?.sellPrice || details?.sellPrice || 0);
  const costEur = costUsd * fxRate;
  const target = Math.max(config.targetRetailMin, costEur * config.markupMultiplier, costEur + config.minimumGrossProfit);
  const price = roundRetail(target);
  if (!price || price > config.maxRetailPrice || price <= costEur) return null;

  const name = stripHtml(details?.productNameEn || raw?.nameEn || raw?.sku || 'Product');
  const description = stripHtml(details?.description || raw?.description || '').slice(0, 700);
  const category = stripHtml(raw?.threeCategoryName || details?.categoryName || raw?.twoCategoryName || raw?.oneCategoryName || 'Everyday');

  return {
    id: String(raw.id),
    sku: String(raw?.sku || raw?.spu || details?.productSku || raw.id),
    brand: 'Virello Select',
    name: { de: name, en: name },
    description: { de: description, en: description },
    category: { de: category, en: category },
    price: Number(price.toFixed(2)),
    compareAt: null,
    cost: Number(costEur.toFixed(2)),
    sourceCost: Number(costUsd.toFixed(2)),
    sourceCurrency: 'USD',
    stock: verifiedInventory.total,
    warehouses: verifiedInventory.warehouses,
    primaryWarehouse: verifiedInventory.primaryWarehouse,
    warehousePriorityRank: warehouseRank(verifiedInventory.primaryWarehouse),
    verifiedStock: true,
    variantStock: verifiedInventory.variants,
    images: selectImages(raw, details),
    supplier: 'CJdropshipping',
    source: 'cj',
    market: MARKET,
    currency: 'EUR',
    listedNum: Number(raw?.listedNum || 0),
    deliveryCycle: raw?.deliveryCycle || null,
    directMinOrderNum: raw?.directMinOrderNum == null ? null : Number(raw.directMinOrderNum),
    complianceSignals: { ce: raw?.hasCECertification == null ? null : Number(raw.hasCECertification) === 1 },
    hasVideo: Number(raw?.isVideo) === 1,
    adCandidate: false,
    score: scoreProduct(raw, verifiedInventory, costEur),
    sellReady: false,
    sellReadyReason: 'EU warehouse stock is verified. Germany freight, payment gateway, legal details and product-specific compliance must still be verified before checkout is enabled.'
  };
}

console.log('Authenticating with CJ...');
const token = await getAccessToken();
const fx = await getUsdToEurRate();
console.log(`USD→EUR source: ${fx.source}`);
console.log(`Allowed verified warehouses: ${ALLOWED_WAREHOUSES.join(', ')}`);

const candidateMap = new Map();
let rawResultCount = 0;
for (const keyword of config.searchKeywords || []) {
  console.log(`Searching broad CJ candidates for EU inventory check: ${keyword}`);
  const payload = await cjGet(token, '/product/listV2', {
    page: 1,
    size: config.searchPageSize || 60,
    keyWord: keyword,
    orderBy: 4,
    sort: 'desc',
    features: ['enable_description', 'enable_category', 'enable_video']
  });

  const rawProducts = parseProductsV2(payload);
  rawResultCount += rawProducts.length;
  for (const raw of rawProducts) {
    const text = normalizedText(raw);
    const costUsd = Number(raw?.nowPrice || raw?.discountPrice || raw?.sellPrice || 0);
    const costEur = costUsd * fx.rate;
    const deliveryMax = parseDeliveryMax(raw?.deliveryCycle);
    const minOrder = raw?.directMinOrderNum == null || raw?.directMinOrderNum === '' ? 1 : Number(raw.directMinOrderNum);
    if (!raw?.id || !(costEur > 0) || costEur > config.maxWholesalePrice) continue;
    if (minOrder > 1) continue;
    if (deliveryMax !== null && deliveryMax > config.maxDeliveryDays) continue;
    if (containsAny(text, config.blockedKeywords || [])) continue;
    if (!containsAny(text, config.preferredCategoryKeywords || [])) continue;
    const existing = candidateMap.get(String(raw.id));
    if (!existing || Number(raw.listedNum || 0) > Number(existing.listedNum || 0)) candidateMap.set(String(raw.id), raw);
  }
}

const candidates = [...candidateMap.values()]
  .sort((a, b) => Number(b.listedNum || 0) - Number(a.listedNum || 0))
  .slice(0, config.maxInventoryVerificationCandidates || 60);

console.log(`CJ listV2 returned ${rawResultCount} rows; checking EU warehouse inventory for ${candidates.length} candidates.`);
const verified = [];
for (const raw of candidates) {
  const inventory = await getVerifiedEuStock(token, raw.id);
  if (inventory.total < config.minStock || !inventory.primaryWarehouse) continue;
  const details = await getProductDetails(token, raw.id);
  const product = buildProduct(raw, details, inventory, fx.rate);
  if (product) verified.push(product);
}

verified.sort((a, b) =>
  a.warehousePriorityRank - b.warehousePriorityRank ||
  b.score - a.score ||
  b.stock - a.stock ||
  b.listedNum - a.listedNum
);
const products = verified.slice(0, config.maxProducts);
products.slice(0, config.maxAdCandidates).forEach((product) => { product.adCandidate = true; });

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: products.length ? 'live-api' : 'live-api-empty',
  selection: {
    market: MARKET,
    warehouseCountries: ALLOWED_WAREHOUSES,
    warehousePriority: WAREHOUSE_PRIORITY,
    verifiedWarehouseOnly: true,
    minStock: config.minStock,
    maxProducts: config.maxProducts,
    exchangeRate: { usdToEur: Number(fx.rate.toFixed(6)), source: fx.source },
    note: 'Product List V2 is used for broad discovery. Every published product independently passed the CJ variant inventory endpoint in an allowed EU warehouse with verifiedWarehouse=1. Germany is ranked first when available. Checkout remains disabled until Germany shipping cost/time and product compliance are verified.'
  },
  products
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${products.length} verified CJ EU-warehouse products for Germany market.`);
