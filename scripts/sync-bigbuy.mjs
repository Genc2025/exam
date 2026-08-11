import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'data', 'catalog-config.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'products.json');

const token = process.env.BIGBUY_API_TOKEN;
const apiBase = (process.env.BIGBUY_API_BASE || 'https://api.bigbuy.eu/rest').replace(/\/$/, '');

if (!token) {
  throw new Error('BIGBUY_API_TOKEN is not configured. Add it as a GitHub Actions repository secret.');
}

const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));

const endpoint = {
  products: process.env.BIGBUY_PRODUCTS_PATH || '/catalog/products.json',
  info: process.env.BIGBUY_INFO_PATH || '/catalog/productsinformation.json',
  images: process.env.BIGBUY_IMAGES_PATH || '/catalog/productsimages.json',
  stock: process.env.BIGBUY_STOCK_PATH || '/catalog/productsstock.json',
  brands: process.env.BIGBUY_BRANDS_PATH || '/catalog/brands.json'
};

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json'
};

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function fetchJson(relativePath, params = {}) {
  const url = new URL(`${apiBase}${relativePath}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`BigBuy API ${response.status} for ${url.pathname}: ${message.slice(0, 300)}`);
  }
  return response.json();
}

function getValue(object, keys, fallback = undefined) {
  for (const key of keys) {
    const parts = key.split('.');
    let current = object;
    let found = true;
    for (const part of parts) {
      if (current == null || !(part in current)) {
        found = false;
        break;
      }
      current = current[part];
    }
    if (found && current !== undefined && current !== null && current !== '') return current;
  }
  return fallback;
}

function getNumber(object, keys, fallback = 0) {
  const value = getValue(object, keys, fallback);
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : fallback;
}

function getId(object) {
  return String(getValue(object, ['id', 'productId', 'product.id', 'idProduct', 'sku'], '') || '');
}

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function roundRetail(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const whole = Math.floor(value);
  const decimal = value - whole;
  if (decimal < 0.3) return Number(`${whole}.90`);
  if (decimal < 0.8) return Number(`${whole}.99`);
  return Number(`${whole + 1}.90`);
}

function indexById(items) {
  const map = new Map();
  for (const item of items) {
    const id = getId(item);
    if (id) map.set(id, item);
  }
  return map;
}

function groupImages(items) {
  const map = new Map();
  for (const item of items) {
    const productId = String(getValue(item, ['productId', 'idProduct', 'product.id', 'id'], '') || '');
    if (!productId) continue;

    const candidates = [];
    const direct = getValue(item, ['url', 'image', 'imageUrl', 'urlImage', 'path']);
    if (typeof direct === 'string' && direct.startsWith('http')) candidates.push(direct);

    const nested = getValue(item, ['images'], []);
    if (Array.isArray(nested)) {
      for (const image of nested) {
        if (typeof image === 'string' && image.startsWith('http')) candidates.push(image);
        else {
          const nestedUrl = getValue(image, ['url', 'imageUrl', 'urlImage', 'path']);
          if (typeof nestedUrl === 'string' && nestedUrl.startsWith('http')) candidates.push(nestedUrl);
        }
      }
    }

    if (!map.has(productId)) map.set(productId, []);
    map.get(productId).push(...candidates);
  }

  for (const [key, list] of map) map.set(key, [...new Set(list)].slice(0, 8));
  return map;
}

function categoryLabel(raw) {
  const value = getValue(raw, [
    'categoryName',
    'category.name',
    'category',
    'familyName',
    'family.name',
    'sectionName'
  ], 'General');
  return typeof value === 'object' ? String(value?.name || 'General') : String(value || 'General');
}

function brandLabel(raw, brandsMap) {
  const direct = getValue(raw, ['brandName', 'brand.name', 'manufacturer', 'brand']);
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const brandId = String(getValue(raw, ['brandId', 'idBrand', 'brand.id'], '') || '');
  return brandsMap.get(brandId) || 'Virello Select';
}

function isBlocked(text) {
  const haystack = text.toLowerCase();
  return config.blockedKeywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function categoryBoost(text) {
  const haystack = text.toLowerCase();
  return config.preferredCategoryKeywords.some((keyword) => haystack.includes(String(keyword).toLowerCase())) ? 12 : 0;
}

function explicitTopSale(raw) {
  const flags = [
    'isTopSale', 'topSale', 'topSales', 'isBestseller', 'bestseller', 'isWinningProduct', 'winningProduct'
  ];
  return flags.some((key) => Boolean(getValue(raw, [key], false)));
}

function scoreProduct(product) {
  let score = 0;
  if (product.isTopSale) score += 45;
  score += categoryBoost(`${product.category.de} ${product.category.en}`);
  score += Math.min(20, Math.log10(Math.max(1, product.stock)) * 7);

  const marginRatio = product.cost > 0 ? product.price / product.cost : 0;
  if (marginRatio >= 2.4) score += 18;
  else if (marginRatio >= 2.0) score += 14;
  else if (marginRatio >= 1.7) score += 8;

  if (product.price >= config.targetRetailMin && product.price <= config.targetRetailMax) score += 16;
  if (product.images.length >= 2) score += 5;
  if (product.description.de.length >= 60) score += 3;
  return Number(score.toFixed(2));
}

console.log('Fetching BigBuy catalog data...');

const [productsPayload, infoDePayload, infoEnPayload, imagesPayload, stockPayload, brandsPayload] = await Promise.all([
  fetchJson(endpoint.products),
  fetchJson(endpoint.info, { isoCode: 'de' }),
  fetchJson(endpoint.info, { isoCode: 'en' }),
  fetchJson(endpoint.images),
  fetchJson(endpoint.stock),
  fetchJson(endpoint.brands).catch((error) => {
    console.warn(`Brands endpoint skipped: ${error.message}`);
    return [];
  })
]);

const rawProducts = asArray(productsPayload);
const infoDe = indexById(asArray(infoDePayload));
const infoEn = indexById(asArray(infoEnPayload));
const stockMap = indexById(asArray(stockPayload));
const imageMap = groupImages(asArray(imagesPayload));
const brandsMap = new Map(
  asArray(brandsPayload).map((brand) => [
    String(getValue(brand, ['id', 'brandId', 'idBrand'], '') || ''),
    String(getValue(brand, ['name', 'brandName'], '') || '')
  ]).filter(([id, name]) => id && name)
);

const products = [];

for (const raw of rawProducts) {
  const id = getId(raw);
  if (!id) continue;

  const de = infoDe.get(id) || {};
  const en = infoEn.get(id) || {};
  const stockRaw = stockMap.get(id) || raw;

  const sku = String(getValue(raw, ['sku', 'reference', 'ref', 'productReference'], id));
  const cost = getNumber(raw, [
    'wholesalePrice',
    'wholesalePriceWithTax',
    'price',
    'costPrice',
    'prices.wholesale',
    'prices.price'
  ]);
  const rrp = getNumber(raw, [
    'retailPrice',
    'recommendedRetailPrice',
    'rrp',
    'pvp',
    'prices.retail',
    'prices.rrp'
  ]);
  const stock = Math.floor(getNumber(stockRaw, [
    'quantity', 'stock', 'available', 'availableQuantity', 'units', 'warehouseStock'
  ], 0));

  if (cost <= 0 || cost > config.maxWholesalePrice) continue;
  if (stock < config.minStock) continue;

  const computedRetail = roundRetail(cost * config.markupMultiplier);
  const sellingPrice = rrp > 0 ? Math.min(rrp, config.maxRetailPrice) : Math.min(computedRetail, config.maxRetailPrice);
  if (sellingPrice < cost * 1.35 || sellingPrice > config.maxRetailPrice) continue;

  const nameDe = normalizeText(getValue(de, ['name', 'title'], getValue(raw, ['name', 'title'], sku)));
  const nameEn = normalizeText(getValue(en, ['name', 'title'], nameDe));
  const descriptionDe = normalizeText(getValue(de, ['description', 'shortDescription', 'text'], getValue(raw, ['description'], '')));
  const descriptionEn = normalizeText(getValue(en, ['description', 'shortDescription', 'text'], descriptionDe));
  const categoryDe = normalizeText(getValue(de, ['categoryName', 'category.name', 'category'], categoryLabel(raw))) || 'Alltag';
  const categoryEn = normalizeText(getValue(en, ['categoryName', 'category.name', 'category'], categoryDe)) || categoryDe;
  const brand = brandLabel(raw, brandsMap);
  const searchable = `${nameDe} ${nameEn} ${descriptionDe} ${descriptionEn} ${categoryDe} ${categoryEn} ${brand}`;
  if (isBlocked(searchable)) continue;

  const images = imageMap.get(id) || [];
  const fallbackImage = getValue(raw, ['image', 'imageUrl', 'urlImage']);
  if (images.length === 0 && typeof fallbackImage === 'string' && fallbackImage.startsWith('http')) images.push(fallbackImage);

  const product = {
    id,
    sku,
    brand,
    name: { de: nameDe || sku, en: nameEn || nameDe || sku },
    description: { de: descriptionDe, en: descriptionEn },
    category: { de: categoryDe, en: categoryEn },
    price: Number(sellingPrice.toFixed(2)),
    compareAt: rrp > sellingPrice ? Number(rrp.toFixed(2)) : null,
    cost: Number(cost.toFixed(2)),
    stock,
    images,
    isTopSale: explicitTopSale(raw),
    adCandidate: false,
    score: 0,
    priceSource: rrp > 0 ? 'bigbuy-rrp' : 'computed-store-price',
    supplier: 'BigBuy',
    market: config.market,
    currency: config.currency
  };

  product.score = scoreProduct(product);
  products.push(product);
}

products.sort((a, b) => b.score - a.score || b.stock - a.stock || a.price - b.price);

const selected = products.slice(0, config.maxProducts);
selected.slice(0, config.maxAdCandidates).forEach((product) => { product.adCandidate = true; });

const output = {
  generatedAt: new Date().toISOString(),
  source: 'bigbuy',
  mode: 'live-api',
  selection: {
    market: config.market,
    maxWholesalePrice: config.maxWholesalePrice,
    maxRetailPrice: config.maxRetailPrice,
    minStock: config.minStock,
    maxProducts: config.maxProducts,
    maxAdCandidates: config.maxAdCandidates,
    note: 'Ad candidate ranking uses catalog signals (stock, margin, price band, category fit) and explicit Top Sales flags when present. It is not claimed to be BigBuy sales-volume ranking unless the API supplies that flag.'
  },
  products: selected
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${selected.length} products to data/products.json (${selected.filter((product) => product.adCandidate).length} ad candidates).`);
