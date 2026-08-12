import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const API_DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 2500);

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const MARKET = String(config.market || 'DE').toUpperCase();
const CONFIGURED_EU = [...new Set((config.warehouseCountries || ['DE', 'FR', 'ES']).map((code) => String(code).toUpperCase()))];
const PRIORITY = (config.warehousePriority || CONFIGURED_EU).map((code) => String(code).toUpperCase());
const CONFIGURED_SET = new Set(CONFIGURED_EU);
const MAX_PRODUCTS = Number(config.maxProducts || 50);
const MAX_PAGES_PER_WAREHOUSE = Number(config.maxPagesPerWarehouse || 1000);
const MIN_STOCK = Number(config.minStock || 1);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastCompletedAt = 0;

async function requestJson(url, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const elapsed = Date.now() - lastCompletedAt;
    if (lastCompletedAt && elapsed < API_DELAY_MS) await wait(API_DELAY_MS - elapsed);

    let response;
    let payload;
    try {
      response = await fetch(url, options);
      const text = await response.text();
      try { payload = text ? JSON.parse(text) : {}; }
      catch { throw new Error(`Invalid CJ JSON from ${new URL(url).pathname}`); }
    } finally {
      lastCompletedAt = Date.now();
    }

    const message = String(payload?.message || '');
    const rateLimited = response?.status === 429 || /too many requests|qps limit/i.test(message);
    if (rateLimited && attempt < 5) {
      await wait(5000 * attempt);
      continue;
    }

    if (!response?.ok || payload?.result === false || payload?.success === false) {
      throw new Error(`CJ API error ${new URL(url).pathname}: ${message || response?.status || 'unknown'}`);
    }
    return payload;
  }
  throw new Error(`CJ retries exhausted for ${new URL(url).pathname}`);
}

async function getToken() {
  const payload = await requestJson(`${API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ apiKey: API_KEY })
  });
  const token = payload?.data?.accessToken;
  if (!token) throw new Error('CJ access token missing.');
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

function containsAny(text, keywords = []) {
  const haystack = String(text || '').toLowerCase();
  return keywords.filter((k) => String(k).trim()).some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function normalizedText(raw) {
  return `${raw?.nameEn || ''} ${raw?.oneCategoryName || ''} ${raw?.twoCategoryName || ''} ${raw?.threeCategoryName || ''} ${stripHtml(raw?.description)}`.toLowerCase();
}

function parseProductsV2(payload) {
  const content = Array.isArray(payload?.data?.content) ? payload.data.content : [];
  return content.flatMap((bucket) => Array.isArray(bucket?.productList) ? bucket.productList : []);
}

function parsePriceRange(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const nums = String(value).match(/\d+(?:\.\d+)?/g)?.map(Number).filter((n) => Number.isFinite(n) && n >= 0) || [];
    if (!nums.length) continue;
    return { min: Math.min(...nums), max: Math.max(...nums), raw: String(value) };
  }
  return null;
}

function warehouseRank(countryCode) {
  const idx = PRIORITY.indexOf(String(countryCode || '').toUpperCase());
  return idx === -1 ? 999 : idx;
}

function roundRetail(value) {
  if (!(value > 0)) return null;
  if (value < 10) return Number((Math.ceil(value * 2) / 2 - 0.01).toFixed(2));
  if (value < 25) return Number(`${Math.floor(value)}.90`);
  return Number(`${Math.floor(value)}.99`);
}

async function getUsdToEurRate() {
  const override = Number(process.env.USD_TO_EUR_RATE || 0);
  if (override > 0) return { rate: override, source: 'env' };

  const response = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', { headers: { Accept: 'application/xml,text/xml' } });
  if (!response.ok) throw new Error(`ECB FX request failed with HTTP ${response.status}.`);
  const xml = await response.text();
  const match = xml.match(/currency=['"]USD['"]\s+rate=['"]([0-9.]+)['"]/i);
  const usdPerEur = Number(match?.[1] || 0);
  if (!(usdPerEur > 0)) throw new Error('Could not parse USD reference rate from ECB.');
  return { rate: 1 / usdPerEur, source: 'ecb' };
}

async function getVerifiedStockByPid(token, pid, allowedSet) {
  const payload = await cjGet(token, '/product/stock/getInventoryByPid', { pid });
  const variantInventories = Array.isArray(payload?.data?.variantInventories) ? payload.data.variantInventories : [];
  const countryTotals = new Map();
  const variants = [];
  let total = 0;

  for (const variant of variantInventories) {
    const rows = Array.isArray(variant?.inventory) ? variant.inventory : [];
    const variantByCountry = new Map();
    let variantTotal = 0;

    for (const row of rows) {
      const countryCode = String(row?.countryCode || '').toUpperCase();
      if (!allowedSet.has(countryCode)) continue;
      if (Number(row?.verifiedWarehouse) !== 1) continue;

      const stockRows = Array.isArray(row?.stock) ? row.stock : [];
      const subStock = stockRows.reduce((sum, item) => sum + Math.max(0, Number(item?.inventory || 0)), 0);
      const stock = subStock || Math.max(0, Number(row?.cjInventory ?? row?.totalInventory ?? 0));
      if (!(stock > 0)) continue;

      variantByCountry.set(countryCode, (variantByCountry.get(countryCode) || 0) + stock);
      countryTotals.set(countryCode, (countryTotals.get(countryCode) || 0) + stock);
      variantTotal += stock;
      total += stock;
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

  const warehouses = [...countryTotals.entries()]
    .map(([countryCode, stock]) => ({ countryCode, areaEn: `${countryCode} Warehouse`, stock, verified: true }))
    .sort((a, b) => warehouseRank(a.countryCode) - warehouseRank(b.countryCode));

  return { total, variants, warehouses, primaryWarehouse: warehouses[0]?.countryCode || null };
}

async function getProductDetails(token, pid) {
  const payload = await cjGet(token, '/product/query', { pid, features: ['enable_video'] });
  return payload?.data || null;
}

function selectImages(raw, details) {
  const urls = [details?.bigImage, ...(details?.productImageSet || []), raw?.bigImage]
    .filter((v) => typeof v === 'string' && /^https:\/\//i.test(v));
  return [...new Set(urls)].slice(0, 8);
}

function scoreProduct(raw, inventory, costEur) {
  let score = 0;
  const listed = Number(raw?.listedNum || 0);
  score += Math.min(30, Math.log10(Math.max(1, inventory.total)) * 10);
  score += Math.min(24, Math.log10(Math.max(1, listed) + 1) * 8);
  if (Number(raw?.isVideo) === 1) score += 10;
  if (costEur >= 2 && costEur <= 10) score += 12;
  const rank = warehouseRank(inventory.primaryWarehouse);
  if (rank === 0) score += 20;
  else if (rank <= 3) score += 10;
  else if (rank < 999) score += 5;
  return Number(score.toFixed(2));
}

function buildProduct(raw, details, inventory, fxRate) {
  const range = parsePriceRange(raw?.nowPrice, raw?.discountPrice, raw?.sellPrice, details?.sellPrice);
  if (!range || !(range.min > 0)) return null;

  const costMinEur = range.min * fxRate;
  const costMaxEur = range.max * fxRate;
  const target = Math.max(
    Number(config.targetRetailMin || 9.9),
    costMinEur * Number(config.markupMultiplier || 2.2),
    costMinEur + Number(config.minimumGrossProfit || 5)
  );
  const price = roundRetail(target);
  if (!price || price <= costMinEur || price > Number(config.maxRetailPrice || 99999)) return null;

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
    cost: Number(costMinEur.toFixed(2)),
    costRange: { min: Number(costMinEur.toFixed(2)), max: Number(costMaxEur.toFixed(2)) },
    sourceCost: Number(range.min.toFixed(2)),
    sourceCostRange: { min: Number(range.min.toFixed(2)), max: Number(range.max.toFixed(2)), raw: range.raw },
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
    score: scoreProduct(raw, inventory, costMinEur),
    sellReady: false,
    sellReadyReason: 'Verified CJ EU warehouse inventory. Display price is provisional from the lowest supplier price in the CJ range; exact variant price, Germany freight and product compliance must be checked before checkout.'
  };
}

console.log('Authenticating with CJ...');
const token = await getToken();
const fx = await getUsdToEurRate();

const warehousePayload = await cjGet(token, '/product/globalWarehouseList');
const allWarehouses = Array.isArray(warehousePayload?.data) ? warehousePayload.data : [];
const activeEuWarehouses = allWarehouses
  .filter((w) => w?.disabled !== true && CONFIGURED_SET.has(String(w?.countryCode || '').toUpperCase()))
  .map((w) => ({ countryCode: String(w.countryCode).toUpperCase(), areaEn: w?.areaEn || w?.en || w?.nameEn || String(w.countryCode).toUpperCase() }))
  .sort((a, b) => warehouseRank(a.countryCode) - warehouseRank(b.countryCode));
const activeSet = new Set(activeEuWarehouses.map((w) => w.countryCode));

console.log(`CJ active EU warehouses: ${activeEuWarehouses.map((w) => w.countryCode).join(', ') || 'none'}`);

const candidateMap = new Map();
const discoveryStats = {};

for (const warehouse of activeEuWarehouses) {
  const countryCode = warehouse.countryCode;
  let page = 1;
  let totalPages = 1;
  let totalRecords = 0;
  let returnedRows = 0;
  let eligibleRows = 0;

  do {
    console.log(`CJ listV2 ${countryCode} page ${page}/${totalPages}`);
    const payload = await cjGet(token, '/product/listV2', {
      page,
      size: 100,
      countryCode,
      startWarehouseInventory: MIN_STOCK,
      verifiedWarehouse: 1,
      isWarehouse: true,
      orderBy: 4,
      sort: 'desc',
      features: ['enable_description', 'enable_category', 'enable_video']
    });

    totalPages = Math.max(1, Number(payload?.data?.totalPages || 1));
    totalRecords = Number(payload?.data?.totalRecords || totalRecords);
    const rows = parseProductsV2(payload);
    returnedRows += rows.length;

    for (const raw of rows) {
      const text = normalizedText(raw);
      const range = parsePriceRange(raw?.nowPrice, raw?.discountPrice, raw?.sellPrice);
      const minOrder = raw?.directMinOrderNum == null || raw?.directMinOrderNum === '' ? 1 : Number(raw.directMinOrderNum);
      if (!raw?.id || !range || !(range.min > 0)) continue;
      if (range.min * fx.rate > Number(config.maxWholesalePrice || 10000)) continue;
      if (minOrder > 1) continue;
      if (containsAny(text, config.blockedKeywords || [])) continue;
      const preferred = (config.preferredCategoryKeywords || []).filter((k) => String(k).trim());
      if (preferred.length && !containsAny(text, preferred)) continue;

      eligibleRows += 1;
      const id = String(raw.id);
      const existing = candidateMap.get(id);
      const candidate = { ...raw, discoveryCountry: countryCode };
      if (!existing || warehouseRank(countryCode) < warehouseRank(existing.discoveryCountry)) candidateMap.set(id, candidate);
    }

    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES_PER_WAREHOUSE);

  discoveryStats[countryCode] = { totalRecords, returnedRows, eligibleRows, totalPages };
}

const candidates = [...candidateMap.values()]
  .sort((a, b) => warehouseRank(a.discoveryCountry) - warehouseRank(b.discoveryCountry) || Number(b.listedNum || 0) - Number(a.listedNum || 0));

console.log(`Discovered ${candidates.length} unique verified-EU candidates before variant-level inventory verification.`);

const verified = [];
for (const raw of candidates) {
  const inventory = await getVerifiedStockByPid(token, raw.id, activeSet);
  if (inventory.total < MIN_STOCK || !inventory.primaryWarehouse) continue;
  const details = await getProductDetails(token, raw.id);
  const product = buildProduct(raw, details, inventory, fx.rate);
  if (product) verified.push(product);
}

verified.sort((a, b) => a.warehousePriorityRank - b.warehousePriorityRank || b.score - a.score || b.stock - a.stock || b.listedNum - a.listedNum);
const products = verified.slice(0, MAX_PRODUCTS);
products.slice(0, Number(config.maxAdCandidates || 6)).forEach((p) => { p.adCandidate = true; });

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: products.length ? 'live-api' : 'live-api-empty',
  selection: {
    market: MARKET,
    configuredWarehouseCountries: CONFIGURED_EU,
    activeEuWarehouses,
    verifiedWarehouseOnly: true,
    minStock: MIN_STOCK,
    maxProducts: MAX_PRODUCTS,
    discoveryStats,
    exchangeRate: { usdToEur: Number(fx.rate.toFixed(6)), source: fx.source },
    note: 'Corrected CJ EU importer: warehouse discovery comes from product/globalWarehouseList; listV2 is fully paginated; price ranges such as 1.59 -- 12.72 are parsed instead of rejected as NaN; published stock is re-verified with getInventoryByPid. Products remain sellReady=false until exact variant pricing, Germany freight and compliance are verified.'
  },
  products
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${products.length} verified CJ EU-warehouse products.`);
