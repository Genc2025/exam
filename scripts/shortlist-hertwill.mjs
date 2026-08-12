import fs from 'node:fs/promises';

const input = JSON.parse(await fs.readFile('data/hertwill-research.json', 'utf8'));

function unwrap(payload) {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

function text(v) { return String(v ?? '').trim(); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }

const blocked = /baby|kids|child|toy|cosmetic|beauty|skin|lip|makeup|serum|medical|health|therapy|electric|electronic|battery|charger|bluetooth|wifi/i;
const preferred = /organizer|storage|clean|brush|pet|dog|cat|travel|bag|kitchen|bath|home|garden|car/i;

const shippingByBrand = new Map();
for (const entry of input.shippingPriceLists || []) {
  const lists = Array.isArray(entry?.payload?.data) ? entry.payload.data : [];
  const germany = [];
  for (const list of lists) {
    for (const row of list?.shipping_prices || []) {
      if (text(row?.dest_iso_code).toUpperCase() === 'DE') {
        germany.push({
          listId: list.id ?? null,
          listName: list.name ?? null,
          originIsoCode: row.origin_iso_code ?? null,
          destinationIsoCode: row.dest_iso_code ?? null,
          price: row.price ?? null,
          originCountry: row.origin_country ?? null,
          destinationCountry: row.destination_country ?? null
        });
      }
    }
  }
  shippingByBrand.set(String(entry.brandId), germany);
}

const rows = [];
for (const entry of input.details || []) {
  if (entry.error) continue;
  const p = unwrap(entry.detail);
  const brandId = p?.brand?.id ?? entry?.searchRow?.brand?.id ?? null;
  const shippingRegions = Array.isArray(p.shipping_regions) ? p.shipping_regions : [];
  const shipsEU = shippingRegions.some((r) => text(r.code).toUpperCase() === 'EU');
  const stock = num(p.stock) ?? 0;
  const stockStatus = text(p.stock_status);
  const category = text(p?.category?.name || p?.categories?.at?.(-1)?.name || entry?.searchRow?.category?.name);
  const name = text(p.name || entry?.searchRow?.name);
  const brand = text(p?.brand?.name || entry?.searchRow?.brand?.name);
  const origin = text(p?.brand?.shipping_origin_iso_code);
  const riskText = `${name} ${category} ${(p.collections || []).map((x) => x?.name).join(' ')}`;
  const riskBlocked = blocked.test(riskText);
  const relevance = preferred.test(riskText);
  const germanyShipping = shippingByBrand.get(String(brandId)) || [];
  const germanyRoute = germanyShipping.find((x) => x.originIsoCode === origin) || germanyShipping[0] || null;

  rows.push({
    id: p.id ?? entry.id,
    sku: p.sku ?? null,
    name,
    brandId,
    brand,
    category,
    originCountryCode: origin || null,
    stock,
    stockStatus,
    shipsEU,
    germanyShippingRoutePresent: Boolean(germanyRoute),
    germanyShipping: germanyRoute,
    wholesalePrice: p.price ?? null,
    salePrice: p.sale_price ?? null,
    riskBlocked,
    relevance,
    shippingRegions: shippingRegions.map((r) => ({ code: r.code, name: r.name })),
    score: (stock > 0 ? 40 : 0) + (shipsEU ? 25 : 0) + (germanyRoute ? 20 : 0) + (relevance ? 15 : 0) - (riskBlocked ? 100 : 0)
  });
}

const shortlist = rows
  .filter((p) => p.stock > 0 && p.shipsEU && !p.riskBlocked)
  .sort((a, b) => b.score - a.score || b.stock - a.stock || a.name.localeCompare(b.name))
  .slice(0, 15);

await fs.writeFile('data/hertwill-shortlist.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'Hertwill Public API research snapshot',
  note: 'Public Hertwill API currently redacts wholesale and shipping prices as null. Shortlist is based on verified public stock, EU shipping region, Germany route metadata, origin and category risk only. Profit cannot be verified until authenticated pricing is available.',
  candidateCount: shortlist.length,
  shortlist
}, null, 2) + '\n');

console.log(`Wrote ${shortlist.length} Hertwill low-risk EU candidates.`);
