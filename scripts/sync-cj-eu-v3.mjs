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
const WAREHOUSE_COUNTRIES = (config.warehouseCountries || ['DE']).map((v) => String(v).toUpperCase());
const WAREHOUSE_PRIORITY = (config.warehousePriority || WAREHOUSE_COUNTRIES).map((v) => String(v).toUpperCase());
const WAREHOUSE_SET = new Set(WAREHOUSE_COUNTRIES);
const MAX_VERIFY = Number(config.maxInventoryVerificationCandidates || 40);
const PAGE_SIZE = Math.min(200, Math.max(1, Number(config.searchPageSize || 200)));
const MAX_PAGES = Math.min(20, Math.max(1, Number(config.maxDiscoveryPagesPerWarehouse || 10)));

const COUNTRY_NAMES = {
  DE: 'Germany', ES: 'Spain', FR: 'France', GB: 'United Kingdom',
  PL: 'Poland', CZ: 'Czechia', NL: 'Netherlands', AT: 'Austria', IT: 'Italy'
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastApiCompletedAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastApiCompletedAt;
  if (lastApiCompletedAt && elapsed < API_DELAY_MS) await wait(API_DELAY_MS - elapsed);
}

async function requestJson(url, options = {}) {
  await throttle();
  try {
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
    url.searchParams.set(key, String(value));
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
  return keywords
    .map((k) => String(k).trim().toLowerCase())
    .filter(Boolean)
    .some((keyword) => haystack.includes(keyword));
}

function minNumericPrice(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  const values = String(value ?? '').match(/\d+(?:\.\d+)?/g)?.map(Number).filter((n) => n > 0) || [];
  return values.length ? Math.min(...values) : null;
}

function warehouseRank(countryCode) {
  const index = WAREHOUSE_PRIORITY.indexOf(String(countryCode || '').toUpperCase());
  return index === -1 ? 999 : index;
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

async function discoverWarehouse(token, countryCode) {
  const rows = [];
  let total = null;
  let page = 1;

  while (page <= MAX_PAGES) {
    const payload = await cjGet(token, '/product/list', {
      pageNum: page,
      pageSize: PAGE_SIZE,
      countryCode,
      verifiedWarehouse: 1,
      startInventory: Number(config.minStock || 5),
      orderBy: 'listedNum',
      sort: 'desc'
    });

    const list = Array.isArray(payload?.data?.list) ? payload.data.list : [];
    total = Number(payload?.data?.total ?? total ?? 0);
    rows.push(...list.map((raw) => ({ ...raw, discoveryCountry: countryCode })));

    if (!list.length || rows.length >= total || list.length < PAGE_SIZE) break;
    page += 1;
  }

  return { rows, total: Number(total || 0), pagesFetched: page };
}

async function getVerifiedEuStock(token, pid) {
  const payload = await cjGet(token, '/product/stock/getInventoryByPid', { pid });
  const variantInventories = Array.isArray(payload?.data?.variantInventories) ? payload.data.variantInventories : [];
  const variants = [];
  const countryTotals = new Map();
  let total = 0;

  for (const variant of variantInventories) {
    const inventoryRows = Array.isArray(variant?.inventory) ? variant.inventory : [];
    const variantByCountry = new Map();
    let variantTotal = 0;

    for (const row of inventoryRows) {
      const countryCode = String(row?.countryCode || '').toUpperCase();
      if (!WAREHOUSE_SET.has(countryCode) || Number(row?.verifiedWarehouse) !== 1) continue;

      const stockRows = Array.isArray(row?.stock) ? row.stock : [];
      const subWarehouseStock = stockRows.reduce((sum, item) => sum + Math.max(0, Number(item?.inventory || 0)), 0);
      const stock = subWarehouseStock || Math.max(0, Number(row?.cjInventory ?? row?.totalInventory ?? 0));
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
        warehouses: [...variantByCountry.entries()].map(([countryCode, stock]) => ({ countryCode, stock }))
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

  return { total, variants, warehouses, primaryWarehouse: warehouses[0]?.countryCode || null };
}

async function getProductDetails(token, pid, countryCode) {
  const payload = await cjGet(token, '/product/query', { pid, countryCode });
  return payload?.data || null;
}

function chooseInStockVariantCost(details, inventory) {
  const stockedVids = new Set(inventory.variants.map((v) => String(v.vid)));
  const prices = (Array.isArray(details?.variants) ? details.variants : [])
    .filter((variant) => stockedVids.has(String(variant?.vid || '')))
    .map((variant) => minNumericPrice(variant?.variantSellPrice))
    .filter((value) => value > 0);
  if (prices.length) return Math.min(...prices);
  return minNumericPrice(details?.sellPrice);
}

function selectImages(raw, details) {
  const urls = [details?.bigImage, ...(details?.productImageSet || []), raw?.productImage]
    .filter((value) => typeof value === 'string' && /^https:\/\//i.test(value));
  return [...new Set(urls)].slice(0, 8);
}

function scoreProduct(raw, inventory, costEur, text) {
  let score = 0;
  const listed = Number(raw?.listedNum || 0);
  score += Math.min(30, Math.log10(Math.max(1, inventory.total)) * 10);
  score += Math.min(28, Math.log10(Math.max(1, listed) + 1) * 9);
  if (Number(raw?.isVideo) === 1) score += 8;
  if (containsAny(text, config.preferredCategoryKeywords || [])) score += 14;
  if (costEur >= 2 && costEur <= 12) score += 12;
  const rank = warehouseRank(inventory.primaryWarehouse);
  if (rank === 0) score += 20;
  else if (rank === 1) score += 12;
  else if (rank < 999) score += 5;
  return Number(score.toFixed(2));
}

function buildProduct(raw, details, inventory, fxRate) {
  const name = stripHtml(details?.productNameEn || raw?.productNameEn || raw?.productSku || 'Product');
  const category = stripHtml(details?.categoryName || raw?.categoryName || 'Everyday');
  const description = stripHtml(details?.description || '').slice(0, 700);
  const fullText = `${name} ${category} ${description}`.toLowerCase();

  if (containsAny(fullText, config.blockedKeywords || [])) return null;

  const costUsd = chooseInStockVariantCost(details, inventory) || minNumericPrice(raw?.sellPrice);
  if (!(costUsd > 0)) return null;
  const costEur = costUsd * fxRate;
  if (costEur > Number(config.maxWholesalePrice || 20)) return null;

  const target = Math.max(
    Number(config.targetRetailMin || 14.9),
    costEur * Number(config.markupMultiplier || 2.3),
    costEur + Number(config.minimumGrossProfit || 8)
  );
  const price = roundRetail(target);
  if (!price || price > Number(config.maxRetailPrice || 59.9) || price <= costEur) return null;

  return {
    id: String(raw.pid),
    sku: String(raw?.productSku || details?.productSku || raw.pid),
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
    listedNum: Number(details?.listedNum ?? raw?.listedNum ?? 0),
    deliveryCycle: null,
    directMinOrderNum: null,
    complianceSignals: { ce: null },
    hasVideo: Number(raw?.isVideo || 0) === 1,
    adCandidate: false,
    score: scoreProduct(raw, inventory, costEur, fullText),
    sellReady: false,
    sellReadyReason: 'CJ verified warehouse stock confirmed. Germany freight, payment, legal and product-specific compliance still require verification before checkout is enabled.'
  };
}

console.log('Authenticating with CJ...');
const token = await getAccessToken();
const fx = await getUsdToEurRate();
console.log(`USD→EUR source: ${fx.source}`);

const discoveryStats = {};
const candidateMap = new Map();

for (const countryCode of WAREHOUSE_PRIORITY) {
  if (!WAREHOUSE_SET.has(countryCode)) continue;
  console.log(`Legacy warehouse discovery: ${countryCode}`);
  const result = await discoverWarehouse(token, countryCode);
  discoveryStats[countryCode] = {
    totalRecords: result.total,
    pagesFetched: result.pagesFetched,
    fetched: result.rows.length,
    eligibleBeforeInventoryCheck: 0
  };

  for (const raw of result.rows) {
    const nameAndCategory = `${raw?.productNameEn || ''} ${raw?.categoryName || ''}`.toLowerCase();
    if (!raw?.pid) continue;
    if (containsAny(nameAndCategory, config.blockedKeywords || [])) continue;

    const discoveryUsd = minNumericPrice(raw?.sellPrice);
    if (!(discoveryUsd > 0)) continue;
    const discoveryEur = discoveryUsd * fx.rate;
    if (discoveryEur > Number(config.maxWholesalePrice || 20)) continue;

    const existing = candidateMap.get(String(raw.pid));
    if (!existing || warehouseRank(countryCode) < warehouseRank(existing.discoveryCountry)) {
      candidateMap.set(String(raw.pid), raw);
    }
    discoveryStats[countryCode].eligibleBeforeInventoryCheck += 1;
  }
}

const candidates = [...candidateMap.values()]
  .sort((a, b) =>
    warehouseRank(a.discoveryCountry) - warehouseRank(b.discoveryCountry) ||
    Number(b.listedNum || 0) - Number(a.listedNum || 0)
  )
  .slice(0, MAX_VERIFY);

console.log(`Discovery produced ${candidateMap.size} eligible unique products; verifying top ${candidates.length}.`);

const verified = [];
for (const raw of candidates) {
  const inventory = await getVerifiedEuStock(token, raw.pid);
  if (inventory.total < Number(config.minStock || 5) || !inventory.primaryWarehouse) continue;
  const details = await getProductDetails(token, raw.pid, inventory.primaryWarehouse);
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
products.slice(0, Number(config.maxAdCandidates || 6)).forEach((product) => { product.adCandidate = true; });

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: products.length ? 'live-api' : 'live-api-empty',
  selection: {
    market: MARKET,
    warehouseCountries: WAREHOUSE_COUNTRIES,
    warehousePriority: WAREHOUSE_PRIORITY,
    discoveryEndpoint: '/product/list',
    inventoryVerificationEndpoint: '/product/stock/getInventoryByPid',
    verifiedWarehouseOnly: true,
    minStock: Number(config.minStock || 5),
    maxProducts: Number(config.maxProducts || 24),
    discoveryStats,
    exchangeRate: { usdToEur: Number(fx.rate.toFixed(6)), source: fx.source },
    note: 'Legacy CJ product list is used for warehouse discovery because the current List V2 index materially under-reports Germany warehouse products for this account. Every published item is independently verified through getInventoryByPid. Checkout remains disabled pending freight and compliance checks.'
  },
  products
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${products.length} verified CJ warehouse products for Germany market.`);
