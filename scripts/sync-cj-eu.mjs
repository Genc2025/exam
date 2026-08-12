import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const API_DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 2000);

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const MARKET = String(config.market || 'DE').toUpperCase();
const WAREHOUSE_COUNTRIES = (config.warehouseCountries || ['DE']).map((code) => String(code).toUpperCase());
const WAREHOUSE_PRIORITY = (config.warehousePriority || WAREHOUSE_COUNTRIES).map((code) => String(code).toUpperCase());
const WAREHOUSE_SET = new Set(WAREHOUSE_COUNTRIES);
const CANDIDATES_PER_WAREHOUSE = Number(config.candidatesPerWarehouse || 8);
const MAX_VERIFY = Number(config.maxInventoryVerificationCandidates || 48);
const COUNTRY_NAMES = {
  DE: 'Germany',
  PL: 'Poland',
  CZ: 'Czechia',
  NL: 'Netherlands',
  FR: 'France',
  ES: 'Spain'
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastApiCompletedAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastApiCompletedAt;
  if (lastApiCompletedAt && elapsed < API_DELAY_MS) {
    await wait(API_DELAY_MS - elapsed);
  }
}

async function requestJson(url, options = {}) {
  await throttle();
  let response;
  try {
    response = await fetch(url, options);
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
  } finally {
    lastApiCompletedAt = Date.now();
  }
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

function normalizedText(raw) {
  return `${raw?.nameEn || ''} ${raw?.oneCategoryName || ''} ${raw?.twoCategoryName || ''} ${raw?.threeCategoryName || ''} ${stripHtml(raw?.description)}`.toLowerCase();
}

function parseProductsV2(payload) {
  const content = Array.isArray(payload?.data?.content) ? payload.data.content : [];
  return content.flatMap((bucket) => Array.isArray(bucket?.productList) ? bucket.productList : []);
}

function parseDeliveryMax(value) {
  const numbers = String(value || '').match(/\d+/g)?.map(Number) || [];
  return numbers.length ? Math.max(...numbers) : null;
}

function warehouseRank(countryCode) {
  const index = WAREHOUSE_PRIORITY.indexOf(String(countryCode || '').toUpperCase());
  return index === -1 ? 999 : index;
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

async function getVerifiedEuStock(token, pid) {
  const payload = await cjGet(token, '/product/stock/getInventoryByPid', { pid });
  const variantInventories = Array.isArray(payload?.data?.variantInventories) ? payload.data.variantInventories : [];
  const variants = [];
  const countryTotals = new Map();
  let total = 0;

  for (const variant of variantInventories) {
    const rows = Array.isArray(variant?.inventory) ? variant.inventory : [];
    const variantWarehouses = [];
    let variantTotal = 0;

    for (const row of rows) {
      const countryCode = String(row?.countryCode || '').toUpperCase();
      if (!WAREHOUSE_SET.has(countryCode)) continue;
      if (Number(row?.verifiedWarehouse) !== 1) continue;

      const stockRows = Array.isArray(row?.stock) ? row.stock : [];
      const subWarehouseStock = stockRows.reduce(
        (sum, item) => sum + Math.max(0, Number(item?.inventory || 0)),
        0
      );
      const stock = subWarehouseStock || Math.max(0, Number(row?.cjInventory ?? row?.totalInventory ?? 0));
      if (!(stock > 0)) continue;

      variantWarehouses.push({ countryCode, stock });
      countryTotals.set(countryCode, (countryTotals.get(countryCode) || 0) + stock);
      variantTotal += stock;
      total += stock;
    }

    if (variantTotal > 0) {
      variants.push({
        vid: String(variant?.vid || ''),
        stock: variantTotal,
        warehouses: variantWarehouses.sort((a, b) => warehouseRank(a.countryCode) - warehouseRank(b.countryCode))
      });
    }
  }

  const warehouses = [...countryTotals.entries()]
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

function selectImages(raw, details) {
  const urls = [details?.bigImage, ...(details?.productImageSet || []), raw?.bigImage]
    .filter((value) => typeof value === 'string' && /^https:\/\//i.test(value));
  return [...new Set(urls)].slice(0, 8);
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
  if (deliveryMax !== null && deliveryMax <= Number(config.maxDeliveryDays || 7)) score += 6;
  const rank = warehouseRank(inventory.primaryWarehouse);
  if (rank === 0) score += 20;
  else if (rank === 1) score += 14;
  else if (rank === 2 || rank === 3) score += 9;
  else if (rank < 999) score += 5;
  return Number(score.toFixed(2));
}

function buildProduct(raw, details, inventory, fxRate) {
  const costUsd = Number(raw?.nowPrice || raw?.discountPrice || raw?.sellPrice || details?.sellPrice || 0);
  const costEur = costUsd * fxRate;
  const target = Math.max(
    Number(config.targetRetailMin || 14.9),
    costEur * Number(config.markupMultiplier || 2.35),
    costEur + Number(config.minimumGrossProfit || 8)
  );
  const price = roundRetail(target);
  if (!price || price > Number(config.maxRetailPrice || 49.9) || price <= costEur) return null;

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
    stock: inventory.total,
    warehouses: inventory.warehouses,
    primaryWarehouse: inventory.primaryWarehouse,
    warehousePriorityRank: warehouseRank(inventory.primaryWarehouse),
    verifiedStock: true,
    variantStock: inventory.variants,
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
    score: scoreProduct(raw, inventory, costEur),
    sellReady: false,
    sellReadyReason: 'Verified CJ EU warehouse stock. Germany freight cost/time and product-specific compliance still require verification before checkout is enabled.'
  };
}

console.log('Authenticating with CJ...');
const token = await getAccessToken();
const fx = await getUsdToEurRate();
console.log(`USD→EUR source: ${fx.source}`);

const candidateMap = new Map();
const discoveryStats = {};
for (const countryCode of WAREHOUSE_PRIORITY) {
  if (!WAREHOUSE_SET.has(countryCode)) continue;
  console.log(`Direct warehouse discovery: ${countryCode}`);
  const payload = await cjGet(token, '/product/listV2', {
    page: 1,
    size: 100,
    countryCode,
    startWarehouseInventory: Number(config.minStock || 25),
    verifiedWarehouse: 1,
    isWarehouse: true,
    orderBy: 4,
    sort: 'desc',
    features: ['enable_description', 'enable_category', 'enable_video']
  });

  const rows = parseProductsV2(payload);
  discoveryStats[countryCode] = { returned: rows.length, eligible: 0 };
  const eligible = [];

  for (const raw of rows) {
    const text = normalizedText(raw);
    const costUsd = Number(raw?.nowPrice || raw?.discountPrice || raw?.sellPrice || 0);
    const costEur = costUsd * fx.rate;
    const minOrder = raw?.directMinOrderNum == null || raw?.directMinOrderNum === '' ? 1 : Number(raw.directMinOrderNum);
    if (!raw?.id || !(costEur > 0) || costEur > Number(config.maxWholesalePrice || 15)) continue;
    if (minOrder > 1) continue;
    if (containsAny(text, config.blockedKeywords || [])) continue;
    if (!containsAny(text, config.preferredCategoryKeywords || [])) continue;
    eligible.push({ ...raw, discoveryCountry: countryCode });
  }

  eligible.sort((a, b) =>
    Number(b.listedNum || 0) - Number(a.listedNum || 0) ||
    Number(b.warehouseInventoryNum || 0) - Number(a.warehouseInventoryNum || 0)
  );
  discoveryStats[countryCode].eligible = eligible.length;

  for (const raw of eligible.slice(0, CANDIDATES_PER_WAREHOUSE)) {
    const id = String(raw.id);
    const existing = candidateMap.get(id);
    if (!existing || warehouseRank(raw.discoveryCountry) < warehouseRank(existing.discoveryCountry)) {
      candidateMap.set(id, raw);
    }
  }
}

const candidates = [...candidateMap.values()]
  .sort((a, b) =>
    warehouseRank(a.discoveryCountry) - warehouseRank(b.discoveryCountry) ||
    Number(b.listedNum || 0) - Number(a.listedNum || 0)
  )
  .slice(0, MAX_VERIFY);

console.log(`Direct EU discovery produced ${candidates.length} unique candidates.`);
console.log(`Discovery stats: ${JSON.stringify(discoveryStats)}`);

const verified = [];
for (const raw of candidates) {
  const inventory = await getVerifiedEuStock(token, raw.id);
  if (inventory.total < Number(config.minStock || 25) || !inventory.primaryWarehouse) continue;
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

const products = verified.slice(0, Number(config.maxProducts || 24));
products.slice(0, Number(config.maxAdCandidates || 6)).forEach((product) => {
  product.adCandidate = true;
});

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: products.length ? 'live-api' : 'live-api-empty',
  selection: {
    market: MARKET,
    warehouseCountries: WAREHOUSE_COUNTRIES,
    warehousePriority: WAREHOUSE_PRIORITY,
    verifiedWarehouseOnly: true,
    minStock: Number(config.minStock || 25),
    maxProducts: Number(config.maxProducts || 24),
    discoveryStats,
    exchangeRate: { usdToEur: Number(fx.rate.toFixed(6)), source: fx.source },
    note: 'CJ Product List V2 is queried directly per EU warehouse using countryCode, verifiedWarehouse=1 and minimum warehouse inventory. Every published product also passes a second variant-level real-time inventory check. Germany remains first priority. Checkout stays disabled until shipping and compliance are verified.'
  },
  products
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${products.length} verified CJ EU-warehouse products for Germany market.`);
