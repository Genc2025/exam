import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const API_BASE = (process.env.CJ_API_BASE || 'https://developers.cjdropshipping.com/api2.0/v1').replace(/\/$/, '');
const API_KEY = process.env.CJ_API_KEY;
const DELAY_MS = Number(process.env.CJ_API_DELAY_MS || 3000);
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'cj-eu-audit.json');

if (!API_KEY) throw new Error('CJ_API_KEY is not configured.');

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
const configuredCountries = [...new Set((config.warehouseCountries || []).map((v) => String(v).toUpperCase()))];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastCompletedAt = 0;

async function requestJson(url, options = {}) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const elapsed = Date.now() - lastCompletedAt;
    if (lastCompletedAt && elapsed < DELAY_MS) await wait(DELAY_MS - elapsed);

    let response;
    let payload;
    try {
      response = await fetch(url, options);
      const text = await response.text();
      try { payload = text ? JSON.parse(text) : {}; }
      catch { throw new Error(`Invalid JSON from ${new URL(url).pathname}`); }
    } finally {
      lastCompletedAt = Date.now();
    }

    const message = String(payload?.message || '');
    const rateLimited = response?.status === 429 || /too many requests|qps limit/i.test(message);
    if (rateLimited && attempt < 5) {
      const backoff = 5000 * attempt;
      console.log(`CJ rate limit hit; retrying in ${backoff}ms (attempt ${attempt}/5)...`);
      await wait(backoff);
      continue;
    }

    if (!response?.ok || payload?.result === false || payload?.success === false) {
      throw new Error(`CJ API error ${new URL(url).pathname}: ${message || response?.status || 'unknown'}`);
    }
    return payload;
  }
  throw new Error(`CJ request retries exhausted for ${new URL(url).pathname}`);
}

async function getToken() {
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
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, String(item)));
    else url.searchParams.set(key, String(value));
  }
  return requestJson(url, { headers: { 'CJ-Access-Token': token, Accept: 'application/json' } });
}

function listMeta(payload) {
  return {
    totalRecords: Number(payload?.data?.totalRecords || 0),
    totalPages: Number(payload?.data?.totalPages || 0),
    pageSize: Number(payload?.data?.pageSize || 0),
    pageNumber: Number(payload?.data?.pageNumber || 0)
  };
}

function rows(payload) {
  const content = Array.isArray(payload?.data?.content) ? payload.data.content : [];
  return content.flatMap((bucket) => Array.isArray(bucket?.productList) ? bucket.productList : []);
}

const token = await getToken();
const warehousePayload = await cjGet(token, '/product/globalWarehouseList');
const globalWarehouses = Array.isArray(warehousePayload?.data) ? warehousePayload.data : [];
const enabledWarehouseCodes = new Set(
  globalWarehouses.filter((w) => w?.disabled !== true && w?.countryCode).map((w) => String(w.countryCode).toUpperCase())
);

const audit = {
  generatedAt: new Date().toISOString(),
  source: 'cj',
  configuredCountries,
  globalWarehouses: globalWarehouses.map((w) => ({
    countryCode: w?.countryCode || null,
    areaEn: w?.areaEn || w?.en || null,
    disabled: Boolean(w?.disabled)
  })),
  countries: {}
};

for (const countryCode of configuredCountries) {
  console.log(`Auditing ${countryCode}...`);
  const base = { page: 1, size: 1, countryCode, startWarehouseInventory: 1, orderBy: 4, sort: 'desc' };

  const verified = await cjGet(token, '/product/listV2', { ...base, verifiedWarehouse: 1 });
  const verifiedGlobal = await cjGet(token, '/product/listV2', { ...base, verifiedWarehouse: 1, isWarehouse: true });
  const unverified = await cjGet(token, '/product/listV2', { ...base, verifiedWarehouse: 2 });
  const allStock = await cjGet(token, '/product/listV2', base);

  const verifiedMeta = listMeta(verified);
  const country = {
    advertisedByGlobalWarehouseList: enabledWarehouseCodes.has(countryCode),
    verified: verifiedMeta,
    verifiedWithIsWarehouseTrue: listMeta(verifiedGlobal),
    unverified: listMeta(unverified),
    allStock: listMeta(allStock),
    samples: []
  };

  if (verifiedMeta.totalRecords > 0) {
    const samplePayload = await cjGet(token, '/product/listV2', {
      page: 1,
      size: Math.min(100, verifiedMeta.totalRecords),
      countryCode,
      startWarehouseInventory: 1,
      verifiedWarehouse: 1,
      orderBy: 4,
      sort: 'desc',
      features: ['enable_category']
    });
    country.samples = rows(samplePayload).slice(0, 20).map((p) => ({
      id: p?.id || null,
      sku: p?.sku || null,
      name: p?.nameEn || null,
      category: p?.threeCategoryName || p?.twoCategoryName || p?.oneCategoryName || null,
      warehouseInventoryNum: Number(p?.warehouseInventoryNum || 0),
      totalVerifiedInventory: Number(p?.totalVerifiedInventory || 0),
      listedNum: Number(p?.listedNum || 0),
      nowPrice: p?.nowPrice ?? null,
      sellPrice: p?.sellPrice ?? null
    }));
  }

  audit.countries[countryCode] = country;
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(audit, null, 2)}\n`);
}

const totals = Object.entries(audit.countries).map(([countryCode, v]) => ({
  countryCode,
  verified: v.verified.totalRecords,
  verifiedWithIsWarehouseTrue: v.verifiedWithIsWarehouseTrue.totalRecords,
  unverified: v.unverified.totalRecords,
  allStock: v.allStock.totalRecords,
  advertisedByGlobalWarehouseList: v.advertisedByGlobalWarehouseList
}));
audit.summary = {
  countriesWithVerifiedStock: totals.filter((x) => x.verified > 0),
  totalVerifiedCountryProductMatches: totals.reduce((sum, x) => sum + x.verified, 0),
  note: 'Counts are country-product matches and may include the same product in more than one country. Use product inventory endpoint for final per-product verification.'
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit.summary, null, 2));
