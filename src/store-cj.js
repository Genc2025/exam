const app = document.getElementById('app');

const fallbackProducts = [
  {
    id: 'research-pet-hair-remover',
    sku: 'RESEARCH-001',
    brand: 'Virello Select',
    name: { de: 'Pet Hair Remover Roller', en: 'Pet Hair Remover Roller' },
    description: {
      de: 'Research-Produktvorlage. Wird erst durch einen echten CJ-Artikel ersetzt, wenn API, EU-Lagerbestand und Lieferdaten verifiziert sind.',
      en: 'Research product template. It is replaced only after a real CJ item, EU stock and delivery data are verified.'
    },
    category: { de: 'Haustiere', en: 'Pets' },
    price: null,
    targetPrice: 16.9,
    stock: 0,
    warehouses: [],
    images: [],
    supplier: 'CJ pending sync',
    verifiedStock: false,
    adCandidate: true,
    listedNum: null,
    deliveryCycle: null,
    complianceSignals: { ce: null }
  },
  {
    id: 'research-bathroom-organizer',
    sku: 'RESEARCH-002',
    brand: 'Virello Select',
    name: { de: 'No-Drill Bathroom Organizer', en: 'No-Drill Bathroom Organizer' },
    description: {
      de: 'Research-Produktvorlage für einen Organizer ohne Bohren. Live-Daten kommen ausschließlich aus dem verifizierten CJ-Feed.',
      en: 'Research product template for a no-drill organizer. Live data is sourced only from the verified CJ feed.'
    },
    category: { de: 'Bad & Ordnung', en: 'Bathroom & Organization' },
    price: null,
    targetPrice: 18.9,
    stock: 0,
    warehouses: [],
    images: [],
    supplier: 'CJ pending sync',
    verifiedStock: false,
    adCandidate: true,
    listedNum: null,
    deliveryCycle: null,
    complianceSignals: { ce: null }
  }
];

const copy = {
  de: {
    freeShipping: 'EU-Lager priorisiert',
    returns: 'Klare Rückgabeprozesse',
    shop: 'Produkte',
    why: 'Warum Virello',
    faq: 'FAQ',
    search: 'Produkte suchen …',
    cart: 'Warenkorb',
    heroKicker: 'VIRELLO · CJ EU CATALOG',
    heroTitleA: 'Alltagsprodukte.',
    heroTitleB: 'EU-Lager.',
    heroTitleC: 'Klare Auswahl.',
    heroText: 'Wir zeigen nur Produkte, die unser CJ-Import nach Lagerbestand, Preisrahmen und EU-Warehouse-Signalen filtert. Keine erfundenen Bestseller- oder Lagerclaims.',
    discover: 'Produkte ansehen',
    selected: 'Live Auswahl',
    headingA: 'Weniger Produkte.',
    headingB: 'Mehr Klarheit.',
    catalogText: 'Der öffentliche Katalog wird aus CJ synchronisiert. Nur verifizierter EU-Lagerbestand wird als verfügbar angezeigt.',
    all: 'Alle',
    products: 'Produkte',
    noResults: 'Keine Produkte gefunden.',
    tryAgain: 'Andere Suche oder Kategorie versuchen.',
    recommended: 'Für Test ausgewählt',
    available: 'Verifiziert auf Lager',
    research: 'Research',
    details: 'Details',
    add: 'In den Warenkorb',
    added: 'wurde hinzugefügt.',
    target: 'Zielpreis',
    livePrice: 'Live-Preis',
    pricePending: 'Preis nach CJ-Sync',
    warehouse: 'EU-Lager',
    delivery: 'CJ Lieferzyklus',
    listed: 'CJ Listings',
    stock: 'Bestand',
    supplier: 'Lieferant',
    compliance: 'Compliance-Signal',
    ceSignalYes: 'CE-Signal vorhanden',
    ceSignalNo: 'Kein CE-Signal im Feed',
    ceSignalUnknown: 'Nicht verifiziert',
    cartEmpty: 'Dein Warenkorb ist leer.',
    keepShopping: 'Weiter shoppen',
    subtotal: 'Zwischensumme',
    checkout: 'Checkout vorbereiten',
    checkoutNote: 'Checkout bleibt gesperrt, bis Payment Gateway, Versandkosten und Bestellweiterleitung produktiv verifiziert sind.',
    practical: 'Problem → Lösung',
    practicalText: 'Produkte mit sofort verständlichem Nutzen und starkem Video-Demo-Potenzial.',
    price: 'Preisfilter',
    priceText: 'Supplier-Kosten und Zielpreis werden vor Veröffentlichung gefiltert.',
    stockFilter: 'EU-Bestand',
    stockText: 'Live-Verfügbarkeit wird nur aus verifiziertem CJ-Warehouse-Inventar abgeleitet.',
    automation: 'Automatisierung',
    automationText: 'GitHub Actions synchronisiert CJ-Produktdaten regelmäßig in einen sicheren öffentlichen Feed.',
    faqShipQ: 'Woher kommen Produkte und Lagerdaten?',
    faqShipA: 'Aus der offiziellen CJ API. Der Sync prüft Produkte und verifiziert anschließend den Bestand über die Inventory-by-Product-ID-Schnittstelle.',
    faqPriceQ: 'Sind die angezeigten Preise endgültige Verkaufspreise?',
    faqPriceA: 'Live-Preise werden aus Supplier-Kosten und der konfigurierten Marge berechnet. Versandkosten müssen vor Verkaufsstart zusätzlich verifiziert werden.',
    faqTopQ: 'Bedeutet „Für Test ausgewählt“, dass ein Produkt sicher verkauft?',
    faqTopA: 'Nein. Es bedeutet nur, dass das Produkt interne Filter wie Lagerbestand, Preisband und Kategorierelevanz bestanden hat.',
    faqPayQ: 'Kann ich jetzt schon Zahlungen annehmen?',
    faqPayA: 'Nein. Der Checkout ist bewusst deaktiviert, bis Payment Gateway, rechtliche Angaben und Order Routing vollständig verbunden und getestet sind.',
    modeLive: 'CJ Live-Katalog synchronisiert',
    modeDemo: 'Research-Modus · CJ_API_KEY fehlt oder noch kein Live-Feed',
    legal: 'Rechtliches', privacy: 'Datenschutz', terms: 'AGB', imprint: 'Impressum', help: 'Hilfe', shipping: 'Versand',
    close: 'Schließen', qtyDown: 'Menge reduzieren', qtyUp: 'Menge erhöhen', loading: 'Katalog wird geladen …'
  },
  en: {
    freeShipping: 'EU warehouse prioritized',
    returns: 'Clear return flows',
    shop: 'Products',
    why: 'Why Virello',
    faq: 'FAQ',
    search: 'Search products …',
    cart: 'Cart',
    heroKicker: 'VIRELLO · CJ EU CATALOG',
    heroTitleA: 'Everyday products.',
    heroTitleB: 'EU stock.',
    heroTitleC: 'Clear selection.',
    heroText: 'We display products only after our CJ import filters them by stock, price band and EU warehouse signals. No invented bestseller or inventory claims.',
    discover: 'Browse products',
    selected: 'Live selection',
    headingA: 'Fewer products.',
    headingB: 'More clarity.',
    catalogText: 'The public catalog is synchronized from CJ. Only verified EU warehouse inventory is displayed as available.',
    all: 'All',
    products: 'products',
    noResults: 'No products found.',
    tryAgain: 'Try another search or category.',
    recommended: 'Selected for testing',
    available: 'Verified in stock',
    research: 'Research',
    details: 'Details',
    add: 'Add to cart',
    added: 'was added.',
    target: 'Target price',
    livePrice: 'Live price',
    pricePending: 'Price after CJ sync',
    warehouse: 'EU warehouse',
    delivery: 'CJ delivery cycle',
    listed: 'CJ listings',
    stock: 'Stock',
    supplier: 'Supplier',
    compliance: 'Compliance signal',
    ceSignalYes: 'CE signal present',
    ceSignalNo: 'No CE signal in feed',
    ceSignalUnknown: 'Not verified',
    cartEmpty: 'Your cart is empty.',
    keepShopping: 'Keep shopping',
    subtotal: 'Subtotal',
    checkout: 'Prepare checkout',
    checkoutNote: 'Checkout remains disabled until payment gateway, freight cost and order routing are production-verified.',
    practical: 'Problem → solution',
    practicalText: 'Products with instantly understandable utility and strong video-demo potential.',
    price: 'Price filter',
    priceText: 'Supplier cost and target price are filtered before publication.',
    stockFilter: 'EU inventory',
    stockText: 'Live availability is derived only from verified CJ warehouse inventory.',
    automation: 'Automation',
    automationText: 'GitHub Actions synchronizes CJ product data into a safe public feed on a schedule.',
    faqShipQ: 'Where do products and inventory come from?',
    faqShipA: 'From the official CJ API. The sync filters products and then verifies stock using the inventory-by-product-ID endpoint.',
    faqPriceQ: 'Are displayed prices final selling prices?',
    faqPriceA: 'Live prices are calculated from supplier cost and configured margin. Freight still needs to be verified before launch.',
    faqTopQ: 'Does “Selected for testing” mean a product will definitely sell?',
    faqTopA: 'No. It only means the product passed internal filters such as inventory, price band and category relevance.',
    faqPayQ: 'Can I accept payments now?',
    faqPayA: 'No. Checkout is intentionally disabled until the payment gateway, legal details and order routing are fully connected and tested.',
    modeLive: 'CJ live catalog synchronized',
    modeDemo: 'Research mode · CJ_API_KEY missing or live feed not synced yet',
    legal: 'Legal', privacy: 'Privacy', terms: 'Terms', imprint: 'Imprint', help: 'Help', shipping: 'Shipping',
    close: 'Close', qtyDown: 'Decrease quantity', qtyUp: 'Increase quantity', loading: 'Loading catalog …'
  }
};

let lang = localStorage.getItem('virello-language') === 'en' ? 'en' : 'de';
let catalog = { mode: 'loading', products: [] };
let products = [];
let category = '__all__';
let query = '';
let cart = JSON.parse(localStorage.getItem('virello-cart-cj-v1') || '{}');
let activeProductId = null;
let toastTimer = null;

const text = (key) => copy[lang][key] || key;
const local = (value) => typeof value === 'string' ? value : (value?.[lang] || value?.de || value?.en || '');
const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeImage = (url) => typeof url === 'string' && /^https:\/\//i.test(url) ? url : '';
const money = (value) => value == null || Number.isNaN(Number(value))
  ? null
  : new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value));

async function loadCatalog() {
  try {
    const response = await fetch(`./data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await response.json();
    if (feed?.source === 'cj' && Array.isArray(feed.products) && feed.products.length) {
      catalog = feed;
      products = feed.products;
      return;
    }
  } catch (error) {
    console.warn('CJ catalog unavailable:', error);
  }
  catalog = { mode: 'research', source: 'cj', generatedAt: null, products: fallbackProducts };
  products = fallbackProducts;
}

const productName = (product) => local(product.name) || product.sku || 'Product';
const productCategory = (product) => local(product.category) || 'General';
const productDescription = (product) => local(product.description) || '';
const isLiveProduct = (product) => catalog.mode === 'live-api' && product.verifiedStock === true && Number(product.stock || 0) > 0;

function productPriceLabel(product) {
  if (isLiveProduct(product) && money(product.price)) return money(product.price);
  if (money(product.targetPrice)) return `${text('target')}: ${money(product.targetPrice)}`;
  return text('pricePending');
}

function warehouseLabel(product) {
  const warehouses = Array.isArray(product.warehouses) ? product.warehouses : [];
  const codes = warehouses.map((item) => item.countryCode).filter(Boolean);
  return [...new Set(codes)].join(' · ') || '—';
}

function categories() {
  return [...new Set(products.map(productCategory).filter(Boolean))].sort((a, b) => a.localeCompare(b, lang));
}

function filteredProducts() {
  const normalized = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === '__all__' || productCategory(product) === category;
    const haystack = `${productName(product)} ${productCategory(product)} ${product.brand || ''} ${productDescription(product)} ${product.sku || ''}`.toLowerCase();
    return matchesCategory && (!normalized || haystack.includes(normalized));
  });
}

function heroProduct() {
  return products.find((product) => product.adCandidate && isLiveProduct(product)) || products.find(isLiveProduct) || products[0];
}

function imageMarkup(product, className = '') {
  const image = safeImage(product.images?.[0]);
  if (image) {
    return `<div class="product-media ${className}"><img src="${esc(image)}" alt="${esc(productName(product))}" loading="lazy"><span class="media-brand">${esc(product.brand || 'VIRELLO')}</span></div>`;
  }
  const initials = productName(product).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return `<div class="product-media product-placeholder ${className}"><div class="placeholder-orb"></div><strong>${esc(initials || 'V')}</strong><span class="media-brand">${esc(product.brand || 'VIRELLO')}</span></div>`;
}

function badges(product) {
  const labels = [];
  if (product.adCandidate) labels.push(`<span class="badge">${esc(text('recommended'))}</span>`);
  if (isLiveProduct(product)) labels.push(`<span class="badge badge-stock">${esc(text('available'))}</span>`);
  else labels.push(`<span class="badge badge-research">${esc(text('research'))}</span>`);
  return labels.join('');
}

function productCard(product) {
  const live = isLiveProduct(product);
  return `<article class="product-card" data-product="${esc(product.id)}" tabindex="0">
    <div class="product-image-wrap">
      ${imageMarkup(product)}
      <div class="badge-stack">${badges(product)}</div>
      <button class="quick-add" type="button" data-add="${esc(product.id)}" ${live ? '' : 'disabled'} aria-label="${esc(text('add'))}">+</button>
    </div>
    <div class="product-info">
      <div class="product-meta"><span>${esc(productCategory(product))}</span><span>${esc(warehouseLabel(product))}</span></div>
      <h3>${esc(productName(product))}</h3>
      <p>${esc(productDescription(product))}</p>
      <div class="price-row"><strong>${esc(productPriceLabel(product))}</strong>${live && product.compareAt && product.compareAt > product.price ? `<del>${esc(money(product.compareAt))}</del>` : ''}</div>
      <div class="signal-row"><span>${live ? `${esc(text('stock'))}: ${Number(product.stock || 0)}` : esc(text('research'))}</span>${product.deliveryCycle ? `<span>${esc(product.deliveryCycle)} d</span>` : ''}</div>
    </div>
  </article>`;
}

function renderShell() {
  const featured = heroProduct();
  const liveCount = products.filter(isLiveProduct).length;
  document.documentElement.lang = lang;
  app.innerHTML = `
    <div class="site-shell">
      <div class="announcement"><span>${esc(text('freeShipping'))}</span><i></i><span>${esc(text('returns'))}</span></div>
      <header class="site-header">
        <a href="#top" class="brand">VIRELLO<span>®</span></a>
        <nav><a href="#shop">${esc(text('shop'))}</a><a href="#why">${esc(text('why'))}</a><a href="#faq">${esc(text('faq'))}</a></nav>
        <div class="header-actions">
          <div class="language-switch"><button class="${lang === 'de' ? 'active' : ''}" data-lang="de">DE</button><button class="${lang === 'en' ? 'active' : ''}" data-lang="en">EN</button></div>
          <button class="search-button" type="button" aria-label="${esc(text('search'))}">⌕</button>
          <button class="cart-button" type="button"><span>${esc(text('cart'))}</span><b>${cartCount()}</b></button>
        </div>
      </header>
      <div class="search-panel" hidden><input type="search" value="${esc(query)}" placeholder="${esc(text('search'))}"><button type="button">×</button></div>
      <main id="top">
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">${esc(text('heroKicker'))}</span>
            <h1>${esc(text('heroTitleA'))}<br><em>${esc(text('heroTitleB'))}</em><br>${esc(text('heroTitleC'))}</h1>
            <p>${esc(text('heroText'))}</p>
            <div class="hero-actions"><a href="#shop" class="primary-button">${esc(text('discover'))}</a><a href="#why" class="text-link">${esc(text('why'))} ↗</a></div>
            <div class="feed-state ${catalog.mode === 'live-api' ? 'live' : ''}"><span></span>${esc(catalog.mode === 'live-api' ? text('modeLive') : text('modeDemo'))}</div>
          </div>
          <div class="hero-stage">
            <div class="hero-orbit"></div>
            ${featured ? `<div class="hero-card" data-product="${esc(featured.id)}">${imageMarkup(featured, 'hero-media')}<div class="hero-card-copy"><span>${esc(isLiveProduct(featured) ? text('available') : text('research'))}</span><strong>${esc(productName(featured))}</strong><b>${esc(productPriceLabel(featured))}</b></div></div>` : ''}
            <div class="hero-stats"><div><b>${liveCount}</b><span>${esc(text('available'))}</span></div><div><b>${products.length}</b><span>${esc(text('products'))}</span></div></div>
          </div>
        </section>

        <section class="trust-strip">
          <div><b>01</b><span><strong>${esc(text('practical'))}</strong><small>${esc(text('practicalText'))}</small></span></div>
          <div><b>02</b><span><strong>${esc(text('price'))}</strong><small>${esc(text('priceText'))}</small></span></div>
          <div><b>03</b><span><strong>${esc(text('stockFilter'))}</strong><small>${esc(text('stockText'))}</small></span></div>
        </section>

        <section class="shop-section" id="shop">
          <div class="section-heading"><div><span class="eyebrow">${esc(text('selected'))}</span><h2>${esc(text('headingA'))}<br><em>${esc(text('headingB'))}</em></h2></div><p>${esc(text('catalogText'))}</p></div>
          <div class="catalog-toolbar"><div class="category-list"><button class="category-chip ${category === '__all__' ? 'active' : ''}" data-category="__all__">${esc(text('all'))}</button>${categories().map((item) => `<button class="category-chip ${category === item ? 'active' : ''}" data-category="${esc(item)}">${esc(item)}</button>`).join('')}</div><span class="result-count"></span></div>
          <div class="product-grid"></div><div class="empty-state" hidden><strong>${esc(text('noResults'))}</strong><span>${esc(text('tryAgain'))}</span></div>
        </section>

        <section class="value-section" id="why">
          <div><span class="eyebrow">VIRELLO SYSTEM</span><h2>Filter.<br><em>Verify.</em><br>Publish.</h2><p>${esc(text('automationText'))}</p></div>
          <div class="value-grid">
            <article><span>01</span><h3>${esc(text('practical'))}</h3><p>${esc(text('practicalText'))}</p></article>
            <article><span>02</span><h3>${esc(text('price'))}</h3><p>${esc(text('priceText'))}</p></article>
            <article><span>03</span><h3>${esc(text('stockFilter'))}</h3><p>${esc(text('stockText'))}</p></article>
            <article><span>04</span><h3>${esc(text('automation'))}</h3><p>${esc(text('automationText'))}</p></article>
          </div>
        </section>

        <section class="faq-section" id="faq"><span class="eyebrow">FAQ</span><h2>${esc(text('faq'))}</h2><div class="faq-list">
          <details><summary>${esc(text('faqShipQ'))}<span>+</span></summary><p>${esc(text('faqShipA'))}</p></details>
          <details><summary>${esc(text('faqPriceQ'))}<span>+</span></summary><p>${esc(text('faqPriceA'))}</p></details>
          <details><summary>${esc(text('faqTopQ'))}<span>+</span></summary><p>${esc(text('faqTopA'))}</p></details>
          <details><summary>${esc(text('faqPayQ'))}<span>+</span></summary><p>${esc(text('faqPayA'))}</p></details>
        </div></section>
      </main>

      <footer><div class="footer-main"><a class="brand">VIRELLO<span>®</span></a><p>EU-first catalog.<br>Verified before launch.</p></div><div class="footer-links"><div><strong>${esc(text('help'))}</strong><a href="#faq">FAQ</a><a href="#faq">${esc(text('shipping'))}</a></div><div><strong>${esc(text('legal'))}</strong><a href="#">${esc(text('imprint'))}</a><a href="#">${esc(text('privacy'))}</a><a href="#">${esc(text('terms'))}</a></div></div><div class="footer-bottom"><span>© 2026 VIRELLO</span><span>${esc(catalog.mode === 'live-api' ? text('modeLive') : text('modeDemo'))}</span></div></footer>
    </div>

    <div class="backdrop" hidden></div>
    <aside class="cart-drawer" aria-hidden="true"><div class="drawer-head"><h2>${esc(text('cart'))}</h2><button type="button" class="cart-close">×</button></div><div class="cart-items"></div><div class="cart-empty" hidden><strong>${esc(text('cartEmpty'))}</strong><button type="button" class="secondary-button cart-continue">${esc(text('keepShopping'))}</button></div><div class="cart-summary"><div><span>${esc(text('subtotal'))}</span><strong class="cart-total"></strong></div><button class="checkout-button" type="button">${esc(text('checkout'))} →</button><small>${esc(text('checkoutNote'))}</small></div></aside>
    <div class="modal-backdrop" hidden></div><div class="product-modal" aria-hidden="true"></div><div class="toast"></div>
  `;

  bindShellEvents();
  renderProducts();
  renderCart();
}

function renderProducts() {
  const list = filteredProducts();
  const grid = document.querySelector('.product-grid');
  const empty = document.querySelector('.empty-state');
  const count = document.querySelector('.result-count');
  if (!grid || !empty || !count) return;
  grid.innerHTML = list.map(productCard).join('');
  empty.hidden = list.length !== 0;
  count.textContent = `${list.length} ${text('products')}`;
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

function cartTotal() {
  return products.reduce((sum, product) => sum + (cart[product.id] || 0) * Number(product.price || 0), 0);
}

function saveCart() {
  localStorage.setItem('virello-cart-cj-v1', JSON.stringify(cart));
}

function addToCart(id) {
  const product = products.find((item) => String(item.id) === String(id));
  if (!product || !isLiveProduct(product) || !Number(product.price)) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(`${productName(product)} ${text('added')}`);
}

function changeQuantity(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (!cart[id]) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const badge = document.querySelector('.cart-button b');
  if (badge) badge.textContent = cartCount();
  const itemsEl = document.querySelector('.cart-items');
  const emptyEl = document.querySelector('.cart-empty');
  const summary = document.querySelector('.cart-summary');
  if (!itemsEl || !emptyEl || !summary) return;

  const items = products.filter((product) => cart[product.id] > 0 && isLiveProduct(product));
  itemsEl.innerHTML = items.map((product) => `<div class="cart-item">${imageMarkup(product)}<div class="cart-item-copy"><strong>${esc(productName(product))}</strong><span>${esc(money(product.price))}</span><div class="qty"><button data-qty="-1" data-id="${esc(product.id)}" aria-label="${esc(text('qtyDown'))}">−</button><span>${cart[product.id]}</span><button data-qty="1" data-id="${esc(product.id)}" aria-label="${esc(text('qtyUp'))}">+</button></div></div><b>${esc(money(product.price * cart[product.id]))}</b></div>`).join('');
  const isEmpty = items.length === 0;
  itemsEl.hidden = isEmpty;
  emptyEl.hidden = !isEmpty;
  summary.hidden = isEmpty;
  const total = document.querySelector('.cart-total');
  if (total) total.textContent = money(cartTotal()) || '€0.00';
}

function openCart() {
  const backdrop = document.querySelector('.backdrop');
  const drawer = document.querySelector('.cart-drawer');
  if (!backdrop || !drawer) return;
  backdrop.hidden = false;
  requestAnimationFrame(() => { backdrop.classList.add('visible'); drawer.classList.add('open'); });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}

function closeCart() {
  const backdrop = document.querySelector('.backdrop');
  const drawer = document.querySelector('.cart-drawer');
  if (!backdrop || !drawer) return;
  backdrop.classList.remove('visible');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => { backdrop.hidden = true; }, 220);
  document.body.classList.remove('locked');
}

function complianceLabel(product) {
  const ce = product?.complianceSignals?.ce;
  if (ce === true) return text('ceSignalYes');
  if (ce === false) return text('ceSignalNo');
  return text('ceSignalUnknown');
}

function openProduct(id) {
  const product = products.find((item) => String(item.id) === String(id));
  if (!product) return;
  activeProductId = id;
  const modal = document.querySelector('.product-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (!modal || !backdrop) return;
  const live = isLiveProduct(product);
  const gallery = (product.images || []).filter(safeImage).slice(0, 4);
  modal.innerHTML = `<div class="modal-grid"><div class="modal-gallery">${gallery.length ? gallery.map((url, index) => `<img src="${esc(url)}" alt="${esc(productName(product))}" class="${index === 0 ? 'main-image' : ''}">`).join('') : imageMarkup(product, 'modal-fallback')}</div><div class="modal-copy"><button class="modal-close" type="button">×</button><div class="badge-stack modal-badges">${badges(product)}</div><span class="modal-category">${esc(product.brand || 'Virello Select')} · ${esc(productCategory(product))}</span><h2>${esc(productName(product))}</h2><div class="modal-price"><strong>${esc(productPriceLabel(product))}</strong>${live && product.compareAt && product.compareAt > product.price ? `<del>${esc(money(product.compareAt))}</del>` : ''}</div><p>${esc(productDescription(product))}</p><div class="fact-grid"><div><span>${esc(text('warehouse'))}</span><strong>${esc(warehouseLabel(product))}</strong></div><div><span>${esc(text('stock'))}</span><strong>${live ? Number(product.stock || 0) : '—'}</strong></div><div><span>${esc(text('delivery'))}</span><strong>${product.deliveryCycle ? `${esc(product.deliveryCycle)} d` : '—'}</strong></div><div><span>${esc(text('listed'))}</span><strong>${product.listedNum == null ? '—' : Number(product.listedNum)}</strong></div><div><span>${esc(text('supplier'))}</span><strong>${esc(product.supplier || 'CJ')}</strong></div><div><span>${esc(text('compliance'))}</span><strong>${esc(complianceLabel(product))}</strong></div></div><button class="modal-add" type="button" data-add="${esc(product.id)}" ${live ? '' : 'disabled'}>${live ? `${esc(text('add'))} · ${esc(money(product.price))}` : esc(text('pricePending'))}</button><small>${esc(text('checkoutNote'))}</small></div></div>`;
  backdrop.hidden = false;
  requestAnimationFrame(() => { backdrop.classList.add('visible'); modal.classList.add('open'); });
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}

function closeProduct() {
  const modal = document.querySelector('.product-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (!modal || !backdrop) return;
  modal.classList.remove('open');
  backdrop.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => { backdrop.hidden = true; }, 220);
  document.body.classList.remove('locked');
  activeProductId = null;
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function bindShellEvents() {
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => {
    lang = button.dataset.lang;
    localStorage.setItem('virello-language', lang);
    category = '__all__';
    renderShell();
  }));

  document.querySelector('.search-button')?.addEventListener('click', () => {
    const panel = document.querySelector('.search-panel');
    if (!panel) return;
    panel.hidden = false;
    panel.querySelector('input')?.focus();
  });
  document.querySelector('.search-panel button')?.addEventListener('click', () => { document.querySelector('.search-panel').hidden = true; });
  document.querySelector('.search-panel input')?.addEventListener('input', (event) => { query = event.target.value; renderProducts(); });
  document.querySelector('.category-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    document.querySelectorAll('.category-chip').forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  });
  document.querySelector('.product-grid')?.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add]');
    if (add) { event.stopPropagation(); addToCart(add.dataset.add); return; }
    const card = event.target.closest('[data-product]');
    if (card) openProduct(card.dataset.product);
  });
  document.querySelector('.product-grid')?.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-product]')) {
      event.preventDefault();
      openProduct(event.target.dataset.product);
    }
  });
  document.querySelector('.hero-card[data-product]')?.addEventListener('click', (event) => openProduct(event.currentTarget.dataset.product));
  document.querySelector('.cart-button')?.addEventListener('click', openCart);
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  document.querySelector('.cart-continue')?.addEventListener('click', closeCart);
  document.querySelector('.backdrop')?.addEventListener('click', closeCart);
  document.querySelector('.cart-items')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-qty]');
    if (button) changeQuantity(button.dataset.id, Number(button.dataset.qty));
  });
  document.querySelector('.checkout-button')?.addEventListener('click', () => showToast(text('checkoutNote')));
  document.querySelector('.modal-backdrop')?.addEventListener('click', closeProduct);
  document.querySelector('.product-modal')?.addEventListener('click', (event) => {
    if (event.target.closest('.modal-close')) closeProduct();
    const add = event.target.closest('[data-add]');
    if (add) addToCart(add.dataset.add);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    if (activeProductId) closeProduct();
  }
});

app.innerHTML = `<div class="loading-screen"><strong>${esc(text('loading'))}</strong></div>`;
await loadCatalog();
renderShell();
