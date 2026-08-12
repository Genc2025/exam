import fs from 'node:fs/promises';

const API = 'https://api.hertwill.com';
const API_KEY = process.env.HERTWILL_API_KEY;
if (!API_KEY) throw new Error('HERTWILL_API_KEY is not configured.');

const VAT_RATE = 0.19;
const PAYMENT_RATE = 0.03;
const TARGET_PROFIT = 15;
const DEST = 'DE';
const SEARCHES = [
  'pet accessories',
  'dog accessories',
  'cat accessories',
  'car organizer',
  'travel accessories',
  'home organizer',
  'storage organizer',
  'bathroom organizer',
  'kitchen accessories',
  'manual cleaning tools',
  'desk organizer',
  'home accessories'
];
const BLOCKED = /cosmetic|beauty|cream|serum|makeup|lip|foundation|concealer|medical|therapy|therapeutic|supplement|vitamin|electronic|electric|battery|charger|led|baby food|food|skincare/i;

async function getJson(path, auth = true) {
  const headers = { accept: 'application/json' };
  if (auth) headers.Authorization = `Bearer ${API_KEY}`;
  const res = await fetch(`${API}${path}`, { headers });
  const text = await res.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Invalid JSON ${res.status} ${path}: ${text.slice(0, 180)}`); }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${payload?.message || text.slice(0, 180)}`);
  return payload;
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

const unwrap = (p) => p?.data && typeof p.data === 'object' && !Array.isArray(p.data) ? p.data : p;
const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v) => String(v ?? '').trim();

function productId(row) { return row?.id ?? row?.product_id ?? row?.productId ?? null; }
function brandId(row) { return row?.brand?.id ?? row?.brand_id ?? row?.brandId ?? null; }
function attractivePrice(v) {
  if (!(v > 0)) return null;
  if (v < 20) return Math.ceil(v) - 0.10;
  if (v < 40) return Math.ceil(v) - 0.10;
  return Math.ceil(v) - 0.01;
}

const discovered = new Map();
for (const q of SEARCHES) {
  const payload = await getJson(`/v1/products/search?q=${encodeURIComponent(q)}`);
  for (const row of rowsFrom(payload)) {
    const id = productId(row);
    if (id == null) continue;
    if (!discovered.has(String(id))) discovered.set(String(id), { row, queries: [q] });
    else discovered.get(String(id)).queries.push(q);
  }
}

const shippingCache = new Map();
async function germanyShipping(bid, origin) {
  if (!bid) return null;
  if (!shippingCache.has(String(bid))) {
    shippingCache.set(String(bid), await getJson(`/v1/brands/${encodeURIComponent(bid)}/shipping-price-lists`));
  }
  const payload = shippingCache.get(String(bid));
  const lists = Array.isArray(payload?.data) ? payload.data : [];
  const rows = lists.flatMap((list) => (list.shipping_prices || [])
    .filter((r) => str(r?.dest_iso_code).toUpperCase() === DEST)
    .map((r) => ({ listId: list.id, listName: list.name, ...r })));
  if (!rows.length) return null;
  return rows.find((r) => str(r.origin_iso_code).toUpperCase() === str(origin).toUpperCase()) || rows[0];
}

const products = [];
for (const [id, found] of [...discovered.entries()].slice(0, 120)) {
  try {
    const p = unwrap(await getJson(`/v1/products/${encodeURIComponent(id)}`)) || {};
    const name = str(p.name || found.row?.name);
    const description = str(p.description || p.short_description || '');
    const category = str(p.category?.name || found.row?.category?.name || p.category_name);
    const brand = str(p.brand?.name || found.row?.brand?.name || p.brand_name);
    const bid = brandId(p) || brandId(found.row);
    const origin = str(p.brand?.shipping_origin_iso_code || p.shipping_origin_iso_code || found.row?.brand?.shipping_origin_iso_code).toUpperCase();
    const stock = num(p.stock) ?? num(found.row?.stock) ?? 0;
    const stockStatus = str(p.stock_status || found.row?.stock_status);
    const regions = Array.isArray(p.shipping_regions) ? p.shipping_regions.map((r) => str(r.code).toUpperCase()) : [];
    const shipsEU = regions.includes('EU');
    const blocked = BLOCKED.test(`${name} ${description} ${category}`);

    const basePrices = [p.sale_price, p.price].map(num).filter((v) => v != null && v > 0);
    const variations = Array.isArray(p.variations) ? p.variations : [];
    const inStockVariations = variations.filter((v) => (num(v.stock) ?? 0) > 0 || str(v.stock_status).toLowerCase() === 'instock');
    const variationPrices = inStockVariations.flatMap((v) => [v.sale_price, v.price]).map(num).filter((v) => v != null && v > 0);
    const supplierCost = basePrices.length ? Math.min(...basePrices) : (variationPrices.length ? Math.min(...variationPrices) : null);

    const ship = shipsEU ? await germanyShipping(bid, origin) : null;
    const shippingCost = num(ship?.price);
    let economics = null;
    if (supplierCost != null && shippingCost != null) {
      const landed = supplierCost + shippingCost;
      const revenueFactor = (1 / (1 + VAT_RATE)) - PAYMENT_RATE;
      const rawNeeded = (landed + TARGET_PROFIT) / revenueFactor;
      const selling = attractivePrice(rawNeeded);
      const vatReserve = selling - selling / (1 + VAT_RATE);
      const paymentReserve = selling * PAYMENT_RATE;
      const profitBeforeAds = selling / (1 + VAT_RATE) - paymentReserve - landed;
      economics = {
        supplierCostEur: +supplierCost.toFixed(2),
        shippingGermanyEur: +shippingCost.toFixed(2),
        landedCostEur: +landed.toFixed(2),
        targetSellingPriceEur: +selling.toFixed(2),
        vatReserveEur: +vatReserve.toFixed(2),
        paymentReserveEur: +paymentReserve.toFixed(2),
        profitBeforeAdsEur: +profitBeforeAds.toFixed(2)
      };
    }

    const suggestedRetailFields = {
      retailPrice: num(p.retail_price),
      recommendedRetailPrice: num(p.recommended_retail_price),
      rrp: num(p.rrp),
      msrp: num(p.msrp),
      compareAtPrice: num(p.compare_at_price)
    };
    const knownRetail = Object.values(suggestedRetailFields).filter((v) => v != null && v > 0);
    const maxKnownRetail = knownRetail.length ? Math.max(...knownRetail) : null;
    const priceVsKnownRetail = economics && maxKnownRetail ? +(economics.targetSellingPriceEur / maxKnownRetail).toFixed(2) : null;

    const image = p.image?.src || p.image?.url || p.image_url || p.thumbnail || p.images?.[0]?.src || p.images?.[0]?.url || null;
    const slug = p.slug || found.row?.slug || null;

    products.push({
      id: Number(id), sku: p.sku || found.row?.sku || null, name, brandId: bid, brand, category,
      originCountryCode: origin || null, stock, stockStatus, shipsEU, blocked,
      sourceQueries: found.queries, image, slug,
      germanyShippingRoute: ship ? { originIsoCode: ship.origin_iso_code, destinationIsoCode: ship.dest_iso_code, price: shippingCost, listName: ship.listName } : null,
      suggestedRetailFields, maxKnownRetail, priceVsKnownRetail,
      variationPriceRange: variationPrices.length ? { min: +Math.min(...variationPrices).toFixed(2), max: +Math.max(...variationPrices).toFixed(2) } : null,
      economics,
      eligible: Boolean(!blocked && shipsEU && stock > 0 && economics && economics.targetSellingPriceEur <= 59.99)
    });
  } catch (error) {
    products.push({ id: Number(id), name: found.row?.name || null, error: error.message, eligible: false });
  }
}

products.sort((a, b) => {
  if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
  const ar = a.priceVsKnownRetail ?? Infinity;
  const br = b.priceVsKnownRetail ?? Infinity;
  if (ar !== br) return ar - br;
  return (a.economics?.targetSellingPriceEur ?? Infinity) - (b.economics?.targetSellingPriceEur ?? Infinity);
});

const output = {
  generatedAt: new Date().toISOString(),
  source: 'Hertwill authenticated API',
  assumptions: { destination: DEST, vatReserveRate: VAT_RATE, paymentFeeReserveRate: PAYMENT_RATE, targetProfitBeforeAdsEur: TARGET_PROFIT },
  discoveredCount: discovered.size,
  scannedCount: products.length,
  eligibleCount: products.filter((p) => p.eligible).length,
  note: 'Target profit is contribution before advertising, returns and business income tax. Final market competitiveness requires external price validation.',
  products
};
await fs.writeFile('data/hertwill-profit-scan.json', JSON.stringify(output, null, 2) + '\n');
console.log(`Hertwill profit scan: ${output.scannedCount} scanned, ${output.eligibleCount} economics-eligible.`);
