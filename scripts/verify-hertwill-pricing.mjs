import fs from 'node:fs/promises';

const API = 'https://api.hertwill.com';
const API_KEY = process.env.HERTWILL_API_KEY;
if (!API_KEY) throw new Error('HERTWILL_API_KEY is not configured.');

const shortlist = JSON.parse(await fs.readFile('data/hertwill-shortlist.json', 'utf8')).shortlist || [];
const VAT_RATE = 0.19;
const PAYMENT_RATE = 0.03;
const TARGET_PROFIT = 15;

async function getJson(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }
  });
  const text = await res.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Invalid JSON ${res.status} ${path}`); }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${payload?.message || text.slice(0, 200)}`);
  return payload;
}

const unwrap = (p) => p?.data && typeof p.data === 'object' && !Array.isArray(p.data) ? p.data : p;
const numberOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function attractivePrice(value) {
  if (!(value > 0)) return null;
  if (value < 30) return Math.ceil(value) - 0.10;
  return Math.ceil(value) - 0.01;
}

const verified = [];
for (const candidate of shortlist) {
  try {
    const productPayload = await getJson(`/v1/products/${encodeURIComponent(candidate.id)}`);
    const product = unwrap(productPayload) || {};
    const shippingPayload = await getJson(`/v1/brands/${encodeURIComponent(candidate.brandId)}/shipping-price-lists`);
    const lists = Array.isArray(shippingPayload?.data) ? shippingPayload.data : [];
    const germanyRows = lists.flatMap((list) => (list.shipping_prices || [])
      .filter((row) => String(row?.dest_iso_code || '').toUpperCase() === 'DE')
      .map((row) => ({ listId: list.id, listName: list.name, ...row })));
    const route = germanyRows.find((row) => String(row.origin_iso_code || '').toUpperCase() === String(candidate.originCountryCode || '').toUpperCase()) || germanyRows[0] || null;

    const productPrices = [product.price, product.sale_price]
      .map(numberOrNull)
      .filter((v) => v != null && v > 0);
    const variationPrices = (product.variations || [])
      .flatMap((v) => [v.sale_price, v.price])
      .map(numberOrNull)
      .filter((v) => v != null && v > 0);
    const supplierCost = productPrices.length ? Math.min(...productPrices) : (variationPrices.length ? Math.min(...variationPrices) : null);
    const shippingCost = numberOrNull(route?.price);

    let economics = null;
    if (supplierCost != null && shippingCost != null) {
      const landed = supplierCost + shippingCost;
      const revenueFactor = (1 / (1 + VAT_RATE)) - PAYMENT_RATE;
      const minimumSellingPrice = attractivePrice((landed + TARGET_PROFIT) / revenueFactor);
      const vatReserve = minimumSellingPrice - minimumSellingPrice / (1 + VAT_RATE);
      const paymentReserve = minimumSellingPrice * PAYMENT_RATE;
      const profitBeforeAds = minimumSellingPrice / (1 + VAT_RATE) - paymentReserve - landed;
      economics = {
        supplierCostEur: Number(supplierCost.toFixed(2)),
        shippingGermanyEur: Number(shippingCost.toFixed(2)),
        landedCostEur: Number(landed.toFixed(2)),
        minimumSellingPriceFor15EurPreAdProfit: Number(minimumSellingPrice.toFixed(2)),
        vatReserveEur: Number(vatReserve.toFixed(2)),
        paymentReserveEur: Number(paymentReserve.toFixed(2)),
        estimatedProfitBeforeAdsEur: Number(profitBeforeAds.toFixed(2))
      };
    }

    verified.push({
      ...candidate,
      authenticatedPriceFields: {
        productPrice: product.price ?? null,
        salePrice: product.sale_price ?? null,
        variationPrices: (product.variations || []).map((v) => ({ id: v.id, sku: v.sku, price: v.price ?? null, salePrice: v.sale_price ?? null, stock: v.stock ?? null })).slice(0, 20),
        germanyShippingPrice: route?.price ?? null
      },
      economics,
      pricingVerified: Boolean(economics)
    });
  } catch (error) {
    verified.push({ ...candidate, pricingVerified: false, error: error.message });
  }
}

verified.sort((a, b) => {
  if (a.pricingVerified !== b.pricingVerified) return a.pricingVerified ? -1 : 1;
  return (a.economics?.minimumSellingPriceFor15EurPreAdProfit ?? Infinity) - (b.economics?.minimumSellingPriceFor15EurPreAdProfit ?? Infinity);
});

await fs.writeFile('data/hertwill-priced-shortlist.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  assumptions: { destination: 'DE', vatReserveRate: VAT_RATE, paymentFeeReserveRate: PAYMENT_RATE, targetProfitBeforeAdsEur: TARGET_PROFIT },
  note: 'Profit is before advertising, returns and business income tax. VAT/payment are conservative demo reserves, not tax advice.',
  products: verified
}, null, 2) + '\n');
console.log(`Verified authenticated Hertwill pricing for ${verified.filter((x) => x.pricingVerified).length}/${verified.length} candidates.`);
