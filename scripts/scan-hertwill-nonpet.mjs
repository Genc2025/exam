import fs from 'node:fs/promises';

const API = 'https://api.hertwill.com';
const KEY = process.env.HERTWILL_API_KEY;
if (!KEY) throw new Error('HERTWILL_API_KEY missing');

const queries = [
  'home organizer', 'storage organizer', 'bathroom organizer', 'kitchen accessories',
  'manual cleaning tools', 'desk organizer', 'car organizer', 'travel organizer',
  'laundry organizer', 'home accessories'
];
const blocked = /cosmetic|beauty|cream|serum|makeup|medical|therapy|supplement|vitamin|electronic|electric|battery|charger|led|food|skincare/i;
const VAT = 0.19, PAYMENT = 0.03, TARGET = 15;

async function get(path) {
  const r = await fetch(`${API}${path}`, { headers: { accept: 'application/json', Authorization: `Bearer ${KEY}` } });
  const t = await r.text();
  const j = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(`HTTP ${r.status} ${path}: ${j?.message || t.slice(0,160)}`);
  return j;
}
const rows = p => Array.isArray(p?.data) ? p.data : Array.isArray(p?.data?.products) ? p.data.products : Array.isArray(p?.products) ? p.products : [];
const unwrap = p => p?.data && !Array.isArray(p.data) ? p.data : p;
const n = v => { if (v === null || v === undefined || v === '') return null; const x=Number(v); return Number.isFinite(x)?x:null; };
const s = v => String(v ?? '').trim();
const pid = p => p?.id ?? p?.product_id ?? p?.productId;
const bid = p => p?.brand?.id ?? p?.brand_id ?? p?.brandId;
const nice = v => v < 40 ? Math.ceil(v)-0.10 : Math.ceil(v)-0.01;

const picks = new Map();
for (const q of queries) {
  const rs = rows(await get(`/v1/products/search?q=${encodeURIComponent(q)}`));
  let kept = 0;
  for (const r of rs) {
    const id = pid(r); if (id == null) continue;
    if (!picks.has(String(id))) { picks.set(String(id), { row:r, queries:[q] }); kept++; }
    else picks.get(String(id)).queries.push(q);
    if (kept >= 15) break;
  }
}

const shipCache = new Map();
async function shipToDE(brandId, origin) {
  if (!brandId) return null;
  if (!shipCache.has(String(brandId))) shipCache.set(String(brandId), await get(`/v1/brands/${brandId}/shipping-price-lists`));
  const p = shipCache.get(String(brandId));
  const all = (Array.isArray(p?.data)?p.data:[]).flatMap(list => (list.shipping_prices||[]).filter(x=>s(x.dest_iso_code).toUpperCase()==='DE').map(x=>({...x,listName:list.name})));
  return all.find(x=>s(x.origin_iso_code).toUpperCase()===s(origin).toUpperCase()) || all[0] || null;
}

const out=[];
for (const [id,f] of picks) {
  try {
    const p=unwrap(await get(`/v1/products/${id}`))||{};
    const name=s(p.name||f.row?.name), category=s(p.category?.name||f.row?.category?.name), desc=s(p.description||p.short_description);
    const brand=s(p.brand?.name||f.row?.brand?.name), brandId=bid(p)||bid(f.row), origin=s(p.brand?.shipping_origin_iso_code||p.shipping_origin_iso_code).toUpperCase();
    const stock=n(p.stock)??n(f.row?.stock)??0;
    const regions=Array.isArray(p.shipping_regions)?p.shipping_regions.map(x=>s(x.code).toUpperCase()):[];
    const shipsEU=regions.includes('EU');
    const isBlocked=blocked.test(`${name} ${category} ${desc}`);
    const vars=Array.isArray(p.variations)?p.variations:[];
    const varPrices=vars.filter(v=>(n(v.stock)??0)>0||s(v.stock_status).toLowerCase()==='instock').flatMap(v=>[v.sale_price,v.price]).map(n).filter(x=>x&&x>0);
    const base=[p.sale_price,p.price].map(n).filter(x=>x&&x>0);
    const cost=base.length?Math.min(...base):(varPrices.length?Math.min(...varPrices):null);
    const sr=shipsEU?await shipToDE(brandId,origin):null, shipping=n(sr?.price);
    let economics=null;
    if(cost!=null&&shipping!=null){
      const landed=cost+shipping, factor=1/(1+VAT)-PAYMENT, sell=nice((landed+TARGET)/factor);
      const vat=sell-sell/(1+VAT), pay=sell*PAYMENT, profit=sell/(1+VAT)-pay-landed;
      economics={supplierCostEur:+cost.toFixed(2),shippingGermanyEur:+shipping.toFixed(2),landedCostEur:+landed.toFixed(2),targetSellingPriceEur:+sell.toFixed(2),vatReserveEur:+vat.toFixed(2),paymentReserveEur:+pay.toFixed(2),profitBeforeAdsEur:+profit.toFixed(2)};
    }
    out.push({id:+id,sku:p.sku||f.row?.sku||null,name,brand,brandId,category,originCountryCode:origin||null,stock,shipsEU,blocked:isBlocked,queries:f.queries,slug:p.slug||f.row?.slug||null,economics,eligible:Boolean(!isBlocked&&shipsEU&&stock>0&&economics&&economics.targetSellingPriceEur<=49.99)});
  } catch(e){ out.push({id:+id,name:f.row?.name||null,error:e.message,eligible:false}); }
}
out.sort((a,b)=>(b.eligible-a.eligible)||((a.economics?.targetSellingPriceEur??999)-(b.economics?.targetSellingPriceEur??999)));
const payload={generatedAt:new Date().toISOString(),source:'Hertwill authenticated API',selectedCount:picks.size,eligibleCount:out.filter(x=>x.eligible).length,assumptions:{destination:'DE',vatReserveRate:VAT,paymentFeeReserveRate:PAYMENT,targetProfitBeforeAdsEur:TARGET},products:out};
await fs.writeFile('data/hertwill-nonpet-scan.json',JSON.stringify(payload,null,2)+'\n');
console.log(`Hertwill balanced scan: ${payload.selectedCount} selected, ${payload.eligibleCount} eligible.`);
