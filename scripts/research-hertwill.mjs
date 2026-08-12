import fs from 'node:fs/promises';

const API = 'https://api.hertwill.com';
const queries = [
  'car organizer',
  'home organizer',
  'cleaning tool',
  'pet accessory',
  'travel organizer',
  'kitchen organizer'
];

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await response.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Non-JSON response ${response.status} from ${url}: ${text.slice(0, 300)}`); }
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}: ${JSON.stringify(json).slice(0, 500)}`);
  return json;
}

function rowsFrom(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of ['products', 'items', 'results']) {
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function productId(row) {
  return row?.id ?? row?.product_id ?? row?.productId ?? null;
}

function brandId(row) {
  return row?.brand?.id ?? row?.brand_id ?? row?.brandId ?? null;
}

const searches = [];
const unique = new Map();
for (const q of queries) {
  const url = `${API}/v1/products/search?q=${encodeURIComponent(q)}`;
  const payload = await getJson(url);
  const rows = rowsFrom(payload);
  searches.push({ q, count: rows.length, payload });
  for (const row of rows) {
    const id = productId(row);
    if (id != null && !unique.has(String(id))) unique.set(String(id), row);
  }
}

const details = [];
for (const [id, searchRow] of [...unique.entries()].slice(0, 40)) {
  try {
    const payload = await getJson(`${API}/v1/products/${encodeURIComponent(id)}`);
    details.push({ id, searchRow, detail: payload });
  } catch (error) {
    details.push({ id, searchRow, error: error.message });
  }
}

const brands = new Map();
for (const entry of details) {
  const detailRows = rowsFrom(entry.detail);
  const d = entry.detail?.data && !Array.isArray(entry.detail.data) ? entry.detail.data : (detailRows[0] || entry.searchRow);
  const bid = brandId(d) || brandId(entry.searchRow);
  if (bid != null) brands.set(String(bid), bid);
}

const shippingPriceLists = [];
for (const [key, bid] of [...brands.entries()].slice(0, 20)) {
  try {
    const payload = await getJson(`${API}/v1/brands/${encodeURIComponent(bid)}/shipping-price-lists`);
    shippingPriceLists.push({ brandId: bid, payload });
  } catch (error) {
    shippingPriceLists.push({ brandId: bid, error: error.message });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  source: 'Hertwill Public API',
  apiBase: API,
  queries,
  uniqueProductCount: unique.size,
  searches,
  details,
  shippingPriceLists
};

await fs.mkdir('data', { recursive: true });
await fs.writeFile('data/hertwill-research.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`Hertwill research complete: ${unique.size} unique products, ${details.length} details, ${shippingPriceLists.length} brand shipping lists.`);
