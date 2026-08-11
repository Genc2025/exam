import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');
const CJ_API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const CJ_API_KEY = process.env.CJ_API_KEY;
const REQUEST_DELAY_MS = Number(process.env.CJ_REQUEST_DELAY_MS || 1100);

if (!CJ_API_KEY) {
  throw new Error('CJ_API_KEY is not configured. Add it as a GitHub Actions repository secret.');
}

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numberValue(value, fallback = 0) {
  const number = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(number) ? number : fallback;
}

function integerValue(value, fallback = 0) {
  return Math.max(0, Math.floor(numberValue(value, fallback)));
}

function roundRetail(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction <= 0.25) return Number(`${floor}.90`);
  if (fraction <= 0.75) return Number(`${floor}.99`);
  return Number(`${floor + 1}.90`);
}

function isBlocked(text) {
  const haystack = String(text || '').toLowerCase();
  return (config.blockedKeywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function categoryBoost(text) {
  const haystack = String(text || '').toLowerCase();
  return (config.preferredCategoryKeywords || []).some((keyword) => haystack.includes(String(keyword).toLowerCase())) ? 18 : 0;
}

function flattenProductList(data) {
  const content = Array.isArray(data?.content) ? data.content : [];
  const products = [];
  for (const group of content) {
    if (Array.isArray(group?.productList)) products.push(...group.productList);
  }
  return products;
}

async function getAccessToken() {
  const response = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ apiKey: CJ_API_KEY })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.accessToken) {
    throw new Error(`CJ authentication failed (${response.status}): ${payload?.message || 'Unknown error'}`);
  }
  return payload.data.accessToken;
}

async function fetchCjJson(accessToken, relativePath, params = {}) {
  const url = new URL(`${CJ_API_BASE}${relativePath}`);
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
    } else if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  await sleep(REQUEST_DELAY_MS);
  const response = await fetch(url, {
    headers: {
      'CJ-Access-Token': accessToken,
      Accept: 'application/json'
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.code !== 200) {
    throw new Error(`CJ API failed (${response.status}) ${url.pathname}: ${payload?.message || 'Unknown error'}`);
  }
  return payload;
}

async function getUsdToEurRate() {
  const response = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
    headers: { Accept: 'application/xml,text/xml' }
  });
  if (!response.ok) throw new Error(`ECB exchange-rate request failed: HTTP ${response.status}`);
  const xml = await response.text();
  const match = xml.match(/currency=['"]USD['"]\s+rate=['"]([0-9.]+)['"]/i);
  if (!match) throw new Error('ECB USD reference rate was not found in the daily feed.');
  const usdPerEur = Number(match[1]);
  if (!Number.isFinite(usdPerEur) || usdPerEur <= 0) throw new Error('ECB USD reference rate is invalid.');
  return {
    usdPerEur,
    usdToEur: 1 / usdPerEur,
    source: 'ECB euro foreign exchange reference rates'
  };
}

function candidateFromCj(raw, countryCode, fx) {
  const id = String(raw?.id || '').trim();
  const sku = String(raw?.sku || raw?.spu || '').trim();
  const name = stripHtml(raw?.nameEn || sku);
  const description = stripHtml(raw?.description || '');
  const category = stripHtml(raw?.threeCategoryName || raw?.twoCategoryName || raw?.oneCategoryName || 'General');
  const supplierCostUsd = numberValue(raw?.discountPrice || raw?.nowPrice || raw?.sellPrice, 0);
  const supplierCostEur = supplierCostUsd * fx.usdToEur;
  const warehouseInventory = integerValue(raw?.warehouseInventoryNum || raw?.totalVerifiedInventory, 0);
  const directMinOrderNum = raw?.directMinOrderNum == null || raw?.directMinOrderNum === '' ? null : integerValue(raw.directMinOrderNum, 0);
  const searchable = `${name} ${description} ${category} ${raw?.oneCategoryName || ''} ${raw?.twoCategoryName || ''}`;

  if (!id || !sku || !name || supplierCostUsd <= 0) return null;
  if (supplierCostEur > config.maxWholesalePrice) return null;
  if (warehouseInventory < config.minStock) return null;
  if (Number(raw?.verifiedWarehouse) !== 1) return null;
  if (raw?.saleStatus && String(raw.saleStatus) !== '3') return null;
  if (directMinOrderNum != null && directMinOrderNum > 1) return null;
  if (isBlocked(searchable)) return null;

  return {
    id,
    sku,
    name,
    description,
    category,
    supplierCostUsd,
    supplierCostEur,
    listedNum: integerValue(raw?.listedNum, 0),
    sourceWarehouseInventory: warehouseInventory,
    sourceCountryCodes: [countryCode],
    bigImage: typeof raw?.bigImage === 'string' ? raw.bigImage : '',
    deliveryCycle: stripHtml(raw?.deliveryCycle || ''),
    productType: String(raw?.productType || ''),
    supplierName: stripHtml(raw?.supplierName || '') || 'CJdropshipping',
    hasCECertification: raw?.hasCECertification == null ? null : Number(raw.hasCECertification) === 1,
    directMinOrderNum,
    scoreSeed: categoryBoost(searchable)
  };
}

function mergeCandidate(existing, next) {
  if (!existing) return next;
  const countries = new Set([...(existing.sourceCountryCodes || []), ...(next.sourceCountryCodes || [])]);
  return {
    ...existing,
    ...next,
    sourceCountryCodes: [...countries],
    sourceWarehouseInventory: Math.max(existing.sourceWarehouseInventory || 0, next.sourceWarehouseInventory || 0),
    listedNum: Math.max(existing.listedNum || 0, next.listedNum || 0),
    description: next.description.length > existing.description.length ? next.description : existing.description
  };
}

function extractVerifiedWarehouses(payload, allowedCountries) {
  const allowed = new Set(allowedCountries);
  const inventories = Array.isArray(payload?.data?.inventories) ? payload.data.inventories : [];
  const warehouses = [];

  for (const item of inventories) {
    const countryCode = String(item?.countryCode || '').toUpperCase();
    const verified = Number(item?.verifiedWarehouse) === 1;
    if (!allowed.has(countryCode) || !verified) continue;

    const stockRows = Array.isArray(item?.stock) ? item.stock : [];
    const stockFromSubWarehouses = stockRows.reduce((sum, row) => sum + integerValue(row?.inventory, 0), 0);
    const stock = stockFromSubWarehouses || integerValue(item?.cjInventory ?? item?.totalInventory, 0);
    if (stock <= 0) continue;

    warehouses.push({
      countryCode,
      areaEn: stripHtml(item?.areaEn || `${countryCode} Warehouse`),
      stock,
      verified: true,
      subWarehouses: stockRows
        .filter((row) => integerValue(row?.inventory, 0) > 0)
        .map((row) => ({ stockId: String(row?.stockId || ''), stock: integerValue(row?.inventory, 0) }))
    });
  }

  return warehouses;
}

function scoreProduct(product) {
  let score = 0;
  score += categoryBoost(`${product.name.en} ${product.category.en}`);
  score += Math.min(30, Math.log10(Math.max(1, product.stock)) * 10);
  score += Math.min(24, Math.log10(Math.max(1, product.listedNum || 0) + 1) * 8);
  if (product.price >= config.targetRetailMin && product.price <= config.targetRetailMax) score += 18;
  if (product.warehouses.some((warehouse) => warehouse.countryCode === 'DE')) score += 16;
  else if (product.warehouses.some((warehouse) => warehouse.countryCode === 'PL' || warehouse.countryCode === 'CZ')) score += 10;
  if (product.images.length > 0) score += 4;
  return Number(score.toFixed(2));
}

console.log('Authenticating with CJ...');
const accessToken = await getAccessToken();
const fx = await getUsdToEurRate();
console.log(`ECB reference rate loaded: 1 EUR = ${fx.usdPerEur.toFixed(4)} USD`);

const candidateMap = new Map();
const searchKeywords = config.searchKeywords || [];
const warehouseCountries = config.warehouseCountries || ['DE'];

for (const keyword of searchKeywords) {
  for (const countryCode of warehouseCountries) {
    console.log(`Searching CJ: keyword="${keyword}" warehouse=${countryCode}`);
    try {
      const payload = await fetchCjJson(accessToken, '/product/listV2', {
        page: 1,
        size: config.searchPageSize || 60,
        keyWord: keyword,
        countryCode,
        startSellPrice: config.minSupplierUsdPrice || 0.5,
        endSellPrice: config.maxSupplierUsdPrice || 50,
        startWarehouseInventory: config.minStock,
        verifiedWarehouse: 1,
        isWarehouse: true,
        orderBy: 4,
        sort: 'desc',
        features: ['enable_description', 'enable_category']
      });

      for (const raw of flattenProductList(payload?.data)) {
        const candidate = candidateFromCj(raw, countryCode, fx);
        if (!candidate) continue;
        candidateMap.set(candidate.id, mergeCandidate(candidateMap.get(candidate.id), candidate));
      }
    } catch (error) {
      console.warn(`Search skipped for ${keyword}/${countryCode}: ${error.message}`);
    }
  }
}

const candidates = [...candidateMap.values()]
  .sort((a, b) => (b.listedNum - a.listedNum) || (b.sourceWarehouseInventory - a.sourceWarehouseInventory))
  .slice(0, config.maxInventoryVerificationCandidates || 36);

console.log(`Verifying inventory for ${candidates.length} CJ candidates...`);
const verifiedProducts = [];

for (const candidate of candidates) {
  try {
    const inventoryPayload = await fetchCjJson(accessToken, '/product/stock/getInventoryByPid', { pid: candidate.id });
    const warehouses = extractVerifiedWarehouses(inventoryPayload, warehouseCountries);
    const stock = warehouses.reduce((sum, warehouse) => sum + warehouse.stock, 0);
    if (stock < config.minStock || warehouses.length === 0) continue;

    const rawRetail = candidate.supplierCostEur * config.markupMultiplier;
    const price = roundRetail(Math.max(config.targetRetailMin, rawRetail));
    if (!price || price > config.maxRetailPrice) continue;
    if (price < candidate.supplierCostEur * config.minimumMarginMultiplier) continue;

    const product = {
      id: candidate.id,
      sku: candidate.sku,
      brand: 'Virello Select',
      name: { de: candidate.name, en: candidate.name },
      description: { de: candidate.description, en: candidate.description },
      category: { de: candidate.category, en: candidate.category },
      price,
      compareAt: null,
      cost: Number(candidate.supplierCostEur.toFixed(2)),
      sourceCost: Number(candidate.supplierCostUsd.toFixed(2)),
      sourceCurrency: 'USD',
      stock,
      warehouses,
      verifiedStock: true,
      images: candidate.bigImage ? [candidate.bigImage] : [],
      supplier: candidate.supplierName,
      source: 'cj',
      market: config.market,
      currency: config.currency,
      listedNum: candidate.listedNum,
      deliveryCycle: candidate.deliveryCycle || null,
      directMinOrderNum: candidate.directMinOrderNum,
      complianceSignals: { ce: candidate.hasCECertification },
      adCandidate: false,
      score: 0,
      sellReady: false,
      sellReadyReason: 'Freight cost, payment gateway and legal/compliance review must be completed before checkout is enabled.'
    };

    product.score = scoreProduct(product);
    verifiedProducts.push(product);
  } catch (error) {
    console.warn(`Inventory verification failed for ${candidate.sku}: ${error.message}`);
  }
}

verifiedProducts.sort((a, b) => b.score - a.score || b.stock - a.stock || b.listedNum - a.listedNum);
const selected = verifiedProducts.slice(0, config.maxProducts);
selected.slice(0, config.maxAdCandidates).forEach((product) => { product.adCandidate = true; });

const output = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  mode: selected.length ? 'live-api' : 'live-api-empty',
  selection: {
    market: config.market,
    warehouseCountries,
    minStock: config.minStock,
    maxWholesalePrice: config.maxWholesalePrice,
    maxRetailPrice: config.maxRetailPrice,
    maxProducts: config.maxProducts,
    maxAdCandidates: config.maxAdCandidates,
    exchangeRate: {
      usdPerEur: Number(fx.usdPerEur.toFixed(6)),
      usdToEur: Number(fx.usdToEur.toFixed(6)),
      source: fx.source
    },
    note: 'Ranking uses CJ catalog signals such as verified warehouse stock, listing count, price band and category fit. It does not claim actual German sales volume. sellReady remains false until freight, checkout and compliance checks are completed.'
  },
  products: selected
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${selected.length} verified CJ products to data/products.json.`);
