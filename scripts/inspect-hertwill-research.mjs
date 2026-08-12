import fs from 'node:fs/promises';

const input = JSON.parse(await fs.readFile('data/hertwill-research.json', 'utf8'));

function unwrap(payload) {
  if (payload == null) return null;
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

function interestingLeaves(value, prefix = '', out = {}, depth = 0) {
  if (depth > 7 || value == null) return out;
  if (Array.isArray(value)) {
    value.slice(0, 5).forEach((v, i) => interestingLeaves(v, `${prefix}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (/id|name|title|price|cost|stock|inventory|available|quantity|variant|brand|country|ship|delivery|currency|sku|category/i.test(p)) {
        if (v == null || ['string','number','boolean'].includes(typeof v)) out[p] = v;
      }
      if (v && typeof v === 'object') interestingLeaves(v, p, out, depth + 1);
    }
    return out;
  }
  return out;
}

const products = (input.details || []).slice(0, 12).map((entry) => ({
  id: entry.id,
  search: interestingLeaves(entry.searchRow),
  detail: interestingLeaves(unwrap(entry.detail))
}));

const shipping = (input.shippingPriceLists || []).slice(0, 12).map((entry) => ({
  brandId: entry.brandId,
  error: entry.error || null,
  fields: interestingLeaves(unwrap(entry.payload))
}));

const output = {
  generatedAt: new Date().toISOString(),
  productSamples: products,
  shippingSamples: shipping
};
await fs.writeFile('data/hertwill-inspect.json', JSON.stringify(output, null, 2) + '\n');
console.log('Wrote data/hertwill-inspect.json');
