const app = document.getElementById('app');

const fallbackProducts = [
  {
    id: 'demo-airjet', sku: 'DEMO-001', brand: 'Virello Select',
    name: { de: 'AirJet Mini', en: 'AirJet Mini' },
    description: { de: 'Kompakter Alltagshelfer für Tastatur, Auto und schwer erreichbare Stellen.', en: 'Compact everyday helper for keyboards, cars and hard-to-reach spaces.' },
    category: { de: 'Technik', en: 'Tech' }, price: 39.9, compareAt: 54.9, cost: null, stock: 0,
    images: [], isTopSale: false, adCandidate: true, score: 0, supplier: 'demo'
  },
  {
    id: 'demo-pawclean', sku: 'DEMO-002', brand: 'Virello Select',
    name: { de: 'PawClean Roller', en: 'PawClean Roller' },
    description: { de: 'Wiederverwendbarer Tierhaarentferner für Sofa, Kleidung, Bett und Auto.', en: 'Reusable pet-hair remover for sofas, clothes, beds and cars.' },
    category: { de: 'Haustiere', en: 'Pets' }, price: 24.9, compareAt: 34.9, cost: null, stock: 0,
    images: [], isTopSale: false, adCandidate: true, score: 0, supplier: 'demo'
  },
  {
    id: 'demo-luma', sku: 'DEMO-003', brand: 'Virello Select',
    name: { de: 'LumaSense Light', en: 'LumaSense Light' },
    description: { de: 'Minimalistische Sensorleuchte für Schrank, Flur, Treppe oder Küche.', en: 'Minimal motion light for closets, hallways, stairs or kitchens.' },
    category: { de: 'Zuhause', en: 'Home' }, price: 29.9, compareAt: 39.9, cost: null, stock: 0,
    images: [], isTopSale: false, adCandidate: true, score: 0, supplier: 'demo'
  },
  {
    id: 'demo-drive', sku: 'DEMO-004', brand: 'Virello Select',
    name: { de: 'DriveSnap Mount', en: 'DriveSnap Mount' },
    description: { de: 'Kompakte Smartphone-Halterung für einen aufgeräumten Innenraum.', en: 'Compact smartphone mount for a cleaner car interior.' },
    category: { de: 'Auto', en: 'Car' }, price: 27.9, compareAt: 37.9, cost: null, stock: 0,
    images: [], isTopSale: false, adCandidate: false, score: 0, supplier: 'demo'
  }
];

const copy = {
  de: {
    freeShipping: 'Kostenloser Versand ab 49 €', returns: '30 Tage Rückgabe', shop: 'Shop', why: 'Warum Virello', faq: 'FAQ',
    search: 'Produkte suchen …', cart: 'Warenkorb', heroKicker: 'Smarter einkaufen', heroTitleA: 'Produkte, die deinen Alltag', heroTitleB: 'einfacher', heroTitleC: 'machen.',
    heroText: 'Ausgewählte Produkte mit klarem Nutzen, fairer Preispositionierung und einem Store, der für mobile Käufer gebaut ist.', discover: 'Produkte entdecken',
    selected: 'Unsere Auswahl', headingA: 'Finde deinen nächsten', headingB: 'Alltagshelfer.', catalogText: 'Preiswerte Produkte mit echtem Lagerbestand werden automatisch aus dem Lieferantenkatalog synchronisiert.',
    all: 'Alle', products: 'Produkte', noResults: 'Keine Produkte gefunden.', tryAgain: 'Versuche eine andere Suche oder Kategorie.',
    recommended: 'Empfohlen', topSale: 'Bestseller', available: 'Verfügbar', demo: 'Demo', details: 'Details', add: 'In den Warenkorb', added: 'wurde hinzugefügt.',
    cartEmpty: 'Dein Warenkorb ist leer.', keepShopping: 'Weiter shoppen', subtotal: 'Zwischensumme', checkout: 'Zur Kasse', checkoutNote: 'Zahlungsintegration folgt vor Verkaufsstart.',
    productData: 'Produktdaten werden automatisch aus dem Lieferantenfeed aktualisiert.', whyTitleA: 'Weniger suchen.', whyTitleB: 'Besser auswählen.',
    whyText: 'Der Katalog priorisiert bezahlbare Artikel, ausreichenden Bestand und Produkte, die sich gut für Social Ads eignen.',
    practical: 'Praktischer Nutzen', practicalText: 'Klare Problem-Lösungs-Produkte statt zufälliger Massenware.',
    price: 'Preisfokus', priceText: 'Der Import filtert teure Produkte bereits vor der Veröffentlichung heraus.',
    stock: 'Bestandsfilter', stockText: 'Produkte ohne ausreichenden Lagerbestand werden nicht in den Live-Katalog übernommen.',
    ads: 'Ad-Auswahl', adsText: 'Die stärksten Kandidaten werden separat priorisiert, ohne unbelegte Bestseller-Claims.',
    faqShipQ: 'Wie werden Produkte aktualisiert?', faqShipA: 'Ein GitHub Action Workflow kann BigBuy regelmäßig abrufen und den öffentlichen Produktfeed aktualisieren.',
    faqPriceQ: 'Wie werden teure Produkte ausgeschlossen?', faqPriceA: 'Die aktuelle Konfiguration begrenzt Lieferantenkosten auf 35 € und den Verkaufspreis auf 69,90 €.',
    faqTopQ: 'Sind alle empfohlenen Produkte echte Bestseller?', faqTopA: 'Nein. Bestseller wird nur angezeigt, wenn ein entsprechendes Signal aus dem Lieferantenfeed vorhanden ist. Andere Produkte werden nur als empfohlen markiert.',
    faqPayQ: 'Ist der Checkout schon live?', faqPayA: 'Noch nicht. Der Katalog und Warenkorb sind vorbereitet; Zahlungsanbieter und Bestellweiterleitung müssen vor Verkaufsstart verbunden werden.',
    legal: 'Rechtliches', privacy: 'Datenschutz', terms: 'AGB', imprint: 'Impressum', help: 'Hilfe', shipping: 'Versand', modeLive: 'Katalog synchronisiert', modeDemo: 'Demo-Katalog · BigBuy Token fehlt',
    close: 'Schließen', qtyDown: 'Menge reduzieren', qtyUp: 'Menge erhöhen', loading: 'Katalog wird geladen …', error: 'Katalog konnte nicht geladen werden.'
  },
  en: {
    freeShipping: 'Free shipping from €49', returns: '30-day returns', shop: 'Shop', why: 'Why Virello', faq: 'FAQ',
    search: 'Search products …', cart: 'Cart', heroKicker: 'Shop smarter', heroTitleA: 'Products that make everyday life', heroTitleB: 'easier', heroTitleC: '.',
    heroText: 'Curated products with clear utility, sensible pricing and a storefront built for mobile shoppers.', discover: 'Explore products',
    selected: 'Our selection', headingA: 'Find your next', headingB: 'everyday essential.', catalogText: 'Affordable products with real inventory are automatically synchronized from the supplier catalog.',
    all: 'All', products: 'products', noResults: 'No products found.', tryAgain: 'Try another search or category.',
    recommended: 'Recommended', topSale: 'Bestseller', available: 'Available', demo: 'Demo', details: 'Details', add: 'Add to cart', added: 'was added.',
    cartEmpty: 'Your cart is empty.', keepShopping: 'Keep shopping', subtotal: 'Subtotal', checkout: 'Checkout', checkoutNote: 'Payment integration will be connected before launch.',
    productData: 'Product data is automatically updated from the supplier feed.', whyTitleA: 'Search less.', whyTitleB: 'Choose better.',
    whyText: 'The catalog prioritizes affordable items, healthy stock levels and products suited to social advertising.',
    practical: 'Practical utility', practicalText: 'Clear problem-solution products instead of random mass listings.',
    price: 'Price focus', priceText: 'The importer filters expensive products before they reach the store.',
    stock: 'Stock filter', stockText: 'Products without sufficient inventory are excluded from the live catalog.',
    ads: 'Ad selection', adsText: 'Strong candidates are prioritized separately without unsupported bestseller claims.',
    faqShipQ: 'How are products updated?', faqShipA: 'A GitHub Actions workflow can regularly fetch BigBuy and refresh the public product feed.',
    faqPriceQ: 'How are expensive products excluded?', faqPriceA: 'The current configuration caps supplier cost at €35 and store price at €69.90.',
    faqTopQ: 'Are all recommended products actual bestsellers?', faqTopA: 'No. Bestseller is displayed only when the supplier feed contains that signal. Other products are marked only as recommended.',
    faqPayQ: 'Is checkout live?', faqPayA: 'Not yet. Catalog and cart are ready; payments and order forwarding must be connected before launch.',
    legal: 'Legal', privacy: 'Privacy', terms: 'Terms', imprint: 'Imprint', help: 'Help', shipping: 'Shipping', modeLive: 'Catalog synchronized', modeDemo: 'Demo catalog · BigBuy token missing',
    close: 'Close', qtyDown: 'Decrease quantity', qtyUp: 'Increase quantity', loading: 'Loading catalog …', error: 'Catalog could not be loaded.'
  }
};

let lang = localStorage.getItem('virello-language') === 'en' ? 'en' : 'de';
let catalog = { mode: 'loading', products: [] };
let products = [];
let category = '__all__';
let query = '';
let cart = JSON.parse(localStorage.getItem('virello-cart-v2') || '{}');
let activeProductId = null;

const money = (value) => new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
const text = (key) => copy[lang][key] || key;
const local = (value) => typeof value === 'string' ? value : (value?.[lang] || value?.de || value?.en || '');
const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const safeImage = (url) => typeof url === 'string' && /^https:\/\//i.test(url) ? url : '';

async function loadCatalog() {
  try {
    const response = await fetch(`./data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await response.json();
    if (Array.isArray(feed.products) && feed.products.length) {
      catalog = feed;
      products = feed.products;
      return;
    }
  } catch (error) {
    console.warn('Catalog feed unavailable:', error);
  }
  catalog = { mode: 'awaiting-api-token', source: 'demo', products: fallbackProducts };
  products = fallbackProducts;
}

const productName = (product) => local(product.name) || product.sku || 'Product';
const productCategory = (product) => local(product.category) || 'General';
const productDescription = (product) => local(product.description) || text('productData');

function categories() {
  return [...new Set(products.map(productCategory).filter(Boolean))].sort((a, b) => a.localeCompare(b, lang));
}

function filteredProducts() {
  const normalized = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === '__all__' || productCategory(product) === category;
    const haystack = `${productName(product)} ${productCategory(product)} ${product.brand || ''} ${productDescription(product)}`.toLowerCase();
    return matchesCategory && (!normalized || haystack.includes(normalized));
  });
}

function heroProduct() {
  return products.find((product) => product.isTopSale) || products.find((product) => product.adCandidate) || products[0];
}

function imageMarkup(product, className = '') {
  const image = safeImage(product.images?.[0]);
  if (image) {
    return `<div class="product-media ${className}"><img src="${esc(image)}" alt="${esc(productName(product))}" loading="lazy"><span class="media-brand">${esc(product.brand || 'VIRELLO')}</span></div>`;
  }
  const initials = productName(product).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return `<div class="product-media product-placeholder ${className}"><div class="placeholder-orb"></div><strong>${esc(initials || 'V')}</strong><span class="media-brand">${esc(product.brand || 'VIRELLO')}</span></div>`;
}

function badge(product) {
  if (product.isTopSale) return `<span class="badge badge-sale">${esc(text('topSale'))}</span>`;
  if (product.adCandidate) return `<span class="badge">${esc(text('recommended'))}</span>`;
  return '';
}

function productCard(product) {
  return `<article class="product-card" data-product="${esc(product.id)}" tabindex="0">
    <div class="product-image-wrap">
      ${imageMarkup(product)}
      ${badge(product)}
      <button class="quick-add" type="button" data-add="${esc(product.id)}" aria-label="${esc(text('add'))}">+</button>
    </div>
    <div class="product-info">
      <div class="product-meta"><span>${esc(product.brand || productCategory(product))}</span>${catalog.mode === 'live-api' ? `<span>${esc(text('available'))}: ${Number(product.stock || 0)}</span>` : `<span>${esc(text('demo'))}</span>`}</div>
      <h3>${esc(productName(product))}</h3>
      <p>${esc(productCategory(product))}</p>
      <div class="price-row"><strong>${money(product.price)}</strong>${product.compareAt && product.compareAt > product.price ? `<del>${money(product.compareAt)}</del>` : ''}</div>
    </div>
  </article>`;
}

function renderShell() {
  const featured = heroProduct();
  const allCategories = categories();
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
            <h1>${esc(text('heroTitleA'))} <em>${esc(text('heroTitleB'))}</em>${esc(text('heroTitleC'))}</h1>
            <p>${esc(text('heroText'))}</p>
            <div class="hero-actions"><a href="#shop" class="primary-button">${esc(text('discover'))}</a><a href="#why" class="text-link">${esc(text('why'))} ↗</a></div>
            <div class="feed-state ${catalog.mode === 'live-api' ? 'live' : ''}"><span></span>${esc(catalog.mode === 'live-api' ? text('modeLive') : text('modeDemo'))}</div>
          </div>
          <div class="hero-stage">${featured ? `<div class="hero-card" data-product="${esc(featured.id)}">${imageMarkup(featured, 'hero-media')}<div class="hero-card-copy"><span>${esc(featured.isTopSale ? text('topSale') : text('recommended'))}</span><strong>${esc(productName(featured))}</strong><b>${money(featured.price)}</b></div></div>` : ''}</div>
        </section>
        <section class="trust-strip"><div><b>01</b><span><strong>${esc(text('practical'))}</strong><small>${esc(text('practicalText'))}</small></span></div><div><b>02</b><span><strong>${esc(text('price'))}</strong><small>${esc(text('priceText'))}</small></span></div><div><b>03</b><span><strong>${esc(text('stock'))}</strong><small>${esc(text('stockText'))}</small></span></div></section>
        <section class="shop-section" id="shop">
          <div class="section-heading"><div><span class="eyebrow">${esc(text('selected'))}</span><h2>${esc(text('headingA'))} <em>${esc(text('headingB'))}</em></h2></div><p>${esc(text('catalogText'))}</p></div>
          <div class="catalog-toolbar"><div class="category-list"><button class="category-chip ${category === '__all__' ? 'active' : ''}" data-category="__all__">${esc(text('all'))}</button>${allCategories.map((item) => `<button class="category-chip ${category === item ? 'active' : ''}" data-category="${esc(item)}">${esc(item)}</button>`).join('')}</div><span class="result-count"></span></div>
          <div class="product-grid"></div><div class="empty-state" hidden><strong>${esc(text('noResults'))}</strong><span>${esc(text('tryAgain'))}</span></div>
        </section>
        <section class="value-section" id="why"><div><span class="eyebrow">${esc(text('why'))}</span><h2>${esc(text('whyTitleA'))}<br><em>${esc(text('whyTitleB'))}</em></h2><p>${esc(text('whyText'))}</p></div><div class="value-grid"><article><span>01</span><h3>${esc(text('practical'))}</h3><p>${esc(text('practicalText'))}</p></article><article><span>02</span><h3>${esc(text('price'))}</h3><p>${esc(text('priceText'))}</p></article><article><span>03</span><h3>${esc(text('stock'))}</h3><p>${esc(text('stockText'))}</p></article><article><span>04</span><h3>${esc(text('ads'))}</h3><p>${esc(text('adsText'))}</p></article></div></section>
        <section class="faq-section" id="faq"><span class="eyebrow">FAQ</span><h2>${esc(text('faq'))}</h2><div class="faq-list"><details><summary>${esc(text('faqShipQ'))}<span>+</span></summary><p>${esc(text('faqShipA'))}</p></details><details><summary>${esc(text('faqPriceQ'))}<span>+</span></summary><p>${esc(text('faqPriceA'))}</p></details><details><summary>${esc(text('faqTopQ'))}<span>+</span></summary><p>${esc(text('faqTopA'))}</p></details><details><summary>${esc(text('faqPayQ'))}<span>+</span></summary><p>${esc(text('faqPayA'))}</p></details></div></section>
      </main>
      <footer><div class="footer-main"><a class="brand">VIRELLO<span>®</span></a><p>Everyday products,<br>better chosen.</p></div><div class="footer-links"><div><strong>${esc(text('help'))}</strong><a href="#faq">FAQ</a><a href="#faq">${esc(text('shipping'))}</a></div><div><strong>${esc(text('legal'))}</strong><a href="#">${esc(text('imprint'))}</a><a href="#">${esc(text('privacy'))}</a><a href="#">${esc(text('terms'))}</a></div></div><div class="footer-bottom"><span>© 2026 VIRELLO</span><span>${esc(catalog.mode === 'live-api' ? text('modeLive') : text('modeDemo'))}</span></div></footer>
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
  if (!grid) return;
  grid.innerHTML = list.map(productCard).join('');
  empty.hidden = list.length !== 0;
  count.textContent = `${list.length} ${text('products')}`;
}

function cartCount() { return Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0); }
function cartTotal() { return products.reduce((sum, product) => sum + (cart[product.id] || 0) * Number(product.price || 0), 0); }
function saveCart() { localStorage.setItem('virello-cart-v2', JSON.stringify(cart)); }

function addToCart(id) {
  if (!products.some((product) => String(product.id) === String(id))) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart(); renderCart();
  const product = products.find((item) => String(item.id) === String(id));
  showToast(`${productName(product)} ${text('added')}`);
}

function changeQuantity(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (!cart[id]) delete cart[id];
  saveCart(); renderCart();
}

function renderCart() {
  const button = document.querySelector('.cart-button b');
  if (button) button.textContent = cartCount();
  const itemsEl = document.querySelector('.cart-items');
  const emptyEl = document.querySelector('.cart-empty');
  const summary = document.querySelector('.cart-summary');
  if (!itemsEl) return;
  const items = products.filter((product) => cart[product.id] > 0);
  itemsEl.innerHTML = items.map((product) => `<div class="cart-item">${imageMarkup(product)}<div class="cart-item-copy"><strong>${esc(productName(product))}</strong><span>${money(product.price)}</span><div class="qty"><button data-qty="-1" data-id="${esc(product.id)}" aria-label="${esc(text('qtyDown'))}">−</button><span>${cart[product.id]}</span><button data-qty="1" data-id="${esc(product.id)}" aria-label="${esc(text('qtyUp'))}">+</button></div></div><b>${money(product.price * cart[product.id])}</b></div>`).join('');
  const isEmpty = items.length === 0;
  itemsEl.hidden = isEmpty; emptyEl.hidden = !isEmpty; summary.hidden = isEmpty;
  const total = document.querySelector('.cart-total'); if (total) total.textContent = money(cartTotal());
}

function openCart() {
  const backdrop = document.querySelector('.backdrop'); const drawer = document.querySelector('.cart-drawer');
  backdrop.hidden = false; requestAnimationFrame(() => { backdrop.classList.add('visible'); drawer.classList.add('open'); });
  drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked');
}
function closeCart() {
  const backdrop = document.querySelector('.backdrop'); const drawer = document.querySelector('.cart-drawer');
  backdrop.classList.remove('visible'); drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => backdrop.hidden = true, 220); document.body.classList.remove('locked');
}

function openProduct(id) {
  const product = products.find((item) => String(item.id) === String(id)); if (!product) return;
  activeProductId = id;
  const modal = document.querySelector('.product-modal'); const backdrop = document.querySelector('.modal-backdrop');
  const gallery = (product.images || []).filter(safeImage).slice(0, 4);
  modal.innerHTML = `<div class="modal-grid"><div class="modal-gallery">${gallery.length ? gallery.map((url, index) => `<img src="${esc(url)}" alt="${esc(productName(product))}" class="${index === 0 ? 'main-image' : ''}">`).join('') : imageMarkup(product, 'modal-fallback')}</div><div class="modal-copy"><button class="modal-close" type="button">×</button>${badge(product)}<span class="modal-category">${esc(product.brand || '')} · ${esc(productCategory(product))}</span><h2>${esc(productName(product))}</h2><div class="modal-price"><strong>${money(product.price)}</strong>${product.compareAt && product.compareAt > product.price ? `<del>${money(product.compareAt)}</del>` : ''}</div><p>${esc(productDescription(product))}</p>${catalog.mode === 'live-api' ? `<div class="stock-note">${esc(text('available'))}: ${Number(product.stock || 0)}</div>` : ''}<button class="modal-add" type="button" data-add="${esc(product.id)}">${esc(text('add'))} · ${money(product.price)}</button><small>${esc(text('productData'))}</small></div></div>`;
  backdrop.hidden = false; requestAnimationFrame(() => { backdrop.classList.add('visible'); modal.classList.add('open'); });
  modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked');
}
function closeProduct() {
  const modal = document.querySelector('.product-modal'); const backdrop = document.querySelector('.modal-backdrop');
  modal.classList.remove('open'); backdrop.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => backdrop.hidden = true, 220); document.body.classList.remove('locked'); activeProductId = null;
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('.toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function bindShellEvents() {
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => { lang = button.dataset.lang; localStorage.setItem('virello-language', lang); category = '__all__'; renderShell(); }));
  document.querySelector('.search-button').addEventListener('click', () => { const panel = document.querySelector('.search-panel'); panel.hidden = false; panel.querySelector('input').focus(); });
  document.querySelector('.search-panel button').addEventListener('click', () => document.querySelector('.search-panel').hidden = true);
  document.querySelector('.search-panel input').addEventListener('input', (event) => { query = event.target.value; renderProducts(); });
  document.querySelector('.category-list').addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (!button) return; category = button.dataset.category; document.querySelectorAll('.category-chip').forEach((item) => item.classList.toggle('active', item === button)); renderProducts(); });
  document.querySelector('.product-grid').addEventListener('click', (event) => { const add = event.target.closest('[data-add]'); if (add) { event.stopPropagation(); addToCart(add.dataset.add); return; } const card = event.target.closest('[data-product]'); if (card) openProduct(card.dataset.product); });
  document.querySelector('.product-grid').addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-product]')) { event.preventDefault(); openProduct(event.target.dataset.product); } });
  const heroCard = document.querySelector('.hero-card[data-product]'); if (heroCard) heroCard.addEventListener('click', () => openProduct(heroCard.dataset.product));
  document.querySelector('.cart-button').addEventListener('click', openCart);
  document.querySelector('.cart-close').addEventListener('click', closeCart);
  document.querySelector('.cart-continue').addEventListener('click', closeCart);
  document.querySelector('.backdrop').addEventListener('click', closeCart);
  document.querySelector('.cart-items').addEventListener('click', (event) => { const button = event.target.closest('[data-qty]'); if (button) changeQuantity(button.dataset.id, Number(button.dataset.qty)); });
  document.querySelector('.checkout-button').addEventListener('click', () => showToast(text('checkoutNote')));
  document.querySelector('.modal-backdrop').addEventListener('click', closeProduct);
  document.querySelector('.product-modal').addEventListener('click', (event) => { if (event.target.closest('.modal-close')) closeProduct(); const add = event.target.closest('[data-add]'); if (add) addToCart(add.dataset.add); });
}

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); if (activeProductId) closeProduct(); } });

const style = document.createElement('style');
style.textContent = `
:root{--ink:#0b0d0c;--paper:#f4f2ea;--card:#fbfaf6;--line:rgba(11,13,12,.12);--muted:#696b66;--accent:#d9ff43;--white:#fff;--shadow:0 24px 70px rgba(11,13,12,.13)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}body.locked{overflow:hidden}button,input{font:inherit}button,a{-webkit-tap-highlight-color:transparent}a{color:inherit;text-decoration:none}.site-shell{max-width:1600px;margin:auto;overflow:hidden}.announcement{min-height:34px;padding:8px 20px;display:flex;justify-content:center;align-items:center;gap:12px;background:var(--ink);color:#f8f8f4;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.announcement i{width:3px;height:3px;border-radius:50%;background:var(--accent)}.site-header{height:78px;padding:0 5vw;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:1px solid var(--line);background:rgba(244,242,234,.94);backdrop-filter:blur(18px);position:relative;z-index:30}.brand{font-size:23px;font-weight:950;letter-spacing:-.06em}.brand span{font-size:8px;vertical-align:top;margin-left:3px}.site-header nav{display:flex;gap:30px;font-size:12px;font-weight:700}.header-actions{justify-self:end;display:flex;align-items:center;gap:8px}.language-switch{display:flex;padding:3px;border:1px solid var(--line);border-radius:999px}.language-switch button{width:32px;height:30px;border:0;border-radius:999px;background:transparent;font-size:9px;font-weight:850;cursor:pointer}.language-switch button.active{background:var(--ink);color:#fff}.search-button,.cart-button{height:42px;border:1px solid var(--line);background:transparent;border-radius:999px;cursor:pointer}.search-button{width:42px;font-size:24px;line-height:1}.cart-button{padding:0 7px 0 16px;display:flex;align-items:center;gap:10px;font-size:11px;font-weight:800}.cart-button b{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:var(--ink);color:#fff;font-size:9px}.search-panel{position:absolute;left:0;right:0;top:112px;z-index:25;padding:15px 5vw;background:var(--paper);border-bottom:1px solid var(--line);box-shadow:0 20px 40px rgba(11,13,12,.07)}.search-panel input{width:calc(100% - 50px);height:56px;border:0;border-bottom:1px solid var(--ink);outline:0;background:transparent;font-size:18px}.search-panel button{width:46px;height:46px;border:0;background:transparent;font-size:28px;cursor:pointer}.hero{min-height:700px;padding:80px 5vw 70px;display:grid;grid-template-columns:.95fr 1.05fr;gap:6vw;align-items:center}.hero-copy{max-width:670px}.eyebrow{display:block;margin-bottom:16px;color:var(--muted);font-size:9px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.hero h1,.section-heading h2,.value-section h2,.faq-section h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(48px,5.8vw,88px);font-weight:500;line-height:.95;letter-spacing:-.055em}.hero h1 em,h2 em{font-weight:400}.hero-copy>p{max-width:560px;margin:28px 0 0;color:var(--muted);font-size:15px;line-height:1.7}.hero-actions{margin-top:32px;display:flex;align-items:center;gap:22px}.primary-button,.secondary-button,.checkout-button{min-height:52px;padding:0 24px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink);border-radius:999px;background:var(--ink);color:#fff;font-size:11px;font-weight:850;cursor:pointer}.text-link{font-size:12px;font-weight:800}.feed-state{margin-top:38px;display:flex;align-items:center;gap:8px;color:var(--muted);font-size:9px;font-weight:750}.feed-state span{width:8px;height:8px;border-radius:50%;background:#d09b35}.feed-state.live span{background:#42a75a}.hero-stage{min-height:510px;display:grid;place-items:center;position:relative}.hero-stage:before{content:"";position:absolute;width:72%;aspect-ratio:1;border-radius:50%;background:var(--accent)}.hero-card{position:relative;width:min(410px,70%);padding:12px;border-radius:28px;background:rgba(255,255,255,.88);box-shadow:var(--shadow);transform:rotate(-4deg);cursor:pointer}.product-media{position:relative;aspect-ratio:1/.88;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#e6e2d4,#c8c1ae);display:grid;place-items:center}.product-media img{width:100%;height:100%;object-fit:contain;background:#fff}.product-placeholder{background:linear-gradient(145deg,#e3ff75,#bfe331)}.placeholder-orb{position:absolute;width:55%;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.5);filter:blur(26px)}.product-placeholder>strong{position:relative;width:34%;aspect-ratio:1;display:grid;place-items:center;border-radius:28%;background:rgba(255,255,255,.78);box-shadow:0 18px 40px rgba(11,13,12,.12);font-family:Georgia,serif;font-size:32px}.media-brand{position:absolute;left:14px;bottom:13px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.82);font-size:7px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.hero-card-copy{padding:15px 9px 8px;display:grid;grid-template-columns:1fr auto;gap:4px 12px}.hero-card-copy span{color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.1em}.hero-card-copy strong{font-size:13px}.hero-card-copy b{grid-row:1/3;grid-column:2;align-self:center;font-size:13px}.trust-strip{margin:0 5vw;padding:26px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;grid-template-columns:repeat(3,1fr)}.trust-strip>div{padding:0 26px;display:flex;gap:15px;border-left:1px solid var(--line)}.trust-strip>div:first-child{border-left:0;padding-left:0}.trust-strip b{font-family:Georgia,serif;font-size:30px;font-weight:400}.trust-strip span{display:flex;flex-direction:column;gap:4px}.trust-strip strong{font-size:11px}.trust-strip small{max-width:290px;color:var(--muted);font-size:9px;line-height:1.5}.shop-section{padding:112px 5vw 124px}.section-heading{display:grid;grid-template-columns:1.15fr .65fr;gap:8vw;align-items:end}.section-heading h2{font-size:clamp(44px,5vw,72px)}.section-heading>p{margin:0 0 6px;color:var(--muted);font-size:13px;line-height:1.7}.catalog-toolbar{margin-top:48px;min-height:54px;display:flex;justify-content:space-between;gap:16px;align-items:center;border-bottom:1px solid var(--line)}.category-list{display:flex;gap:5px;overflow:auto;scrollbar-width:none}.category-chip{border:0;background:transparent;padding:10px 14px;border-radius:999px;color:var(--muted);font-size:10px;font-weight:800;white-space:nowrap;cursor:pointer}.category-chip.active{background:var(--ink);color:#fff}.result-count{color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.09em}.product-grid{margin-top:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:34px 18px}.product-card{min-width:0;cursor:pointer}.product-image-wrap{position:relative;border-radius:20px;overflow:hidden}.product-image-wrap .product-media{transition:transform .35s ease}.product-card:hover .product-media{transform:scale(1.02)}.badge{position:absolute;top:11px;left:11px;z-index:2;padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.9);font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.badge-sale{background:var(--accent)}.quick-add{position:absolute;right:11px;bottom:11px;width:40px;height:40px;border:0;border-radius:50%;background:var(--ink);color:#fff;font-size:21px;cursor:pointer}.product-info{padding:13px 2px 0}.product-meta{display:flex;justify-content:space-between;gap:10px;color:var(--muted);font-size:7px;text-transform:uppercase;letter-spacing:.06em}.product-info h3{margin:7px 0 3px;font-size:13px}.product-info p{margin:0 0 9px;color:var(--muted);font-size:9px}.price-row{display:flex;gap:8px;align-items:baseline}.price-row strong{font-size:12px}.price-row del{color:#96978f;font-size:9px}.empty-state{padding:80px 20px;text-align:center}.empty-state span{display:block;margin-top:8px;color:var(--muted);font-size:11px}.value-section{margin:0 5vw;padding:90px 6vw;border-radius:32px;background:var(--ink);color:#fff;display:grid;grid-template-columns:.72fr 1.28fr;gap:8vw;align-items:center}.value-section h2{font-size:clamp(42px,4.6vw,68px)}.value-section>div:first-child>p{margin-top:24px;color:rgba(255,255,255,.58);font-size:12px;line-height:1.7}.value-section .eyebrow{color:rgba(255,255,255,.45)}.value-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(255,255,255,.14);border-left:1px solid rgba(255,255,255,.14)}.value-grid article{min-height:190px;padding:24px;border-right:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14)}.value-grid article>span{color:rgba(255,255,255,.35);font-size:8px}.value-grid h3{margin:50px 0 8px;font-size:13px}.value-grid p{margin:0;color:rgba(255,255,255,.52);font-size:10px;line-height:1.6}.faq-section{padding:120px 5vw}.faq-section h2{font-size:clamp(42px,4vw,60px)}.faq-list{max-width:900px;margin:48px 0 0 auto;border-top:1px solid var(--line)}.faq-list details{border-bottom:1px solid var(--line)}.faq-list summary{padding:22px 0;display:flex;justify-content:space-between;gap:20px;list-style:none;font-size:12px;font-weight:800;cursor:pointer}.faq-list summary::-webkit-details-marker{display:none}.faq-list summary span{font-size:20px;font-weight:300}.faq-list p{max-width:650px;margin:-3px 0 22px;color:var(--muted);font-size:11px;line-height:1.7}footer{padding:70px 5vw 24px;background:var(--ink);color:#fff}.footer-main{padding-bottom:55px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.14)}.footer-main .brand{font-size:34px}.footer-main p{margin:0;color:rgba(255,255,255,.5);font-family:Georgia,serif;font-size:22px;text-align:right}.footer-links{padding:42px 0 55px;display:grid;grid-template-columns:repeat(2,170px);justify-content:end;gap:30px}.footer-links>div{display:flex;flex-direction:column;gap:10px}.footer-links strong{margin-bottom:6px;color:rgba(255,255,255,.4);font-size:8px;text-transform:uppercase;letter-spacing:.12em}.footer-links a{font-size:10px}.footer-bottom{padding-top:18px;border-top:1px solid rgba(255,255,255,.14);display:flex;justify-content:space-between;color:rgba(255,255,255,.4);font-size:8px;text-transform:uppercase;letter-spacing:.08em}.backdrop,.modal-backdrop{position:fixed;inset:0;z-index:70;background:rgba(11,13,12,.44);backdrop-filter:blur(4px);opacity:0;transition:.22s}.backdrop.visible,.modal-backdrop.visible{opacity:1}.cart-drawer{position:fixed;top:0;right:0;bottom:0;z-index:80;width:min(460px,100vw);padding:25px;background:var(--card);box-shadow:-20px 0 60px rgba(11,13,12,.15);transform:translateX(102%);transition:.28s;display:flex;flex-direction:column}.cart-drawer.open{transform:none}.drawer-head{padding-bottom:20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between}.drawer-head h2{margin:0;font-family:Georgia,serif;font-size:34px;font-weight:500}.drawer-head button,.modal-close{width:38px;height:38px;border:1px solid var(--line);border-radius:50%;background:transparent;font-size:23px;cursor:pointer}.cart-items{padding:10px 0;overflow:auto}.cart-item{padding:11px 0;display:grid;grid-template-columns:76px 1fr auto;gap:12px;align-items:center;border-bottom:1px solid var(--line)}.cart-item .product-media{border-radius:12px}.cart-item .media-brand{display:none}.cart-item-copy strong{display:block;font-size:11px}.cart-item-copy>span{display:block;margin-top:4px;color:var(--muted);font-size:9px}.qty{margin-top:8px;display:inline-flex;border:1px solid var(--line);border-radius:999px}.qty button{width:27px;height:26px;border:0;background:transparent;cursor:pointer}.qty span{min-width:20px;display:grid;place-items:center;font-size:9px}.cart-item>b{align-self:start;font-size:10px}.cart-empty{flex:1;display:grid;place-items:center;align-content:center;gap:18px;text-align:center}.cart-empty .secondary-button{background:var(--accent);color:var(--ink)}.cart-summary{margin-top:auto;padding-top:18px;border-top:1px solid var(--line)}.cart-summary>div{display:flex;justify-content:space-between;font-size:12px}.checkout-button{width:100%;margin-top:15px;background:var(--accent);border-color:var(--accent);color:var(--ink)}.cart-summary small{display:block;margin-top:9px;color:var(--muted);font-size:8px;text-align:center}.product-modal{position:fixed;left:50%;top:50%;z-index:90;width:min(940px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:14px;border-radius:28px;background:var(--card);box-shadow:var(--shadow);opacity:0;transform:translate(-50%,-46%) scale(.98);pointer-events:none;transition:.22s}.product-modal.open{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}.modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}.modal-gallery{min-height:500px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.modal-gallery img{width:100%;height:150px;object-fit:contain;background:#fff;border-radius:14px}.modal-gallery img.main-image{grid-column:1/-1;height:330px}.modal-gallery>.product-media{grid-column:1/-1;min-height:500px}.modal-copy{padding:20px 24px 20px 0;display:flex;flex-direction:column;align-items:flex-start}.modal-close{align-self:flex-end}.modal-copy>.badge{position:static;margin-top:15px}.modal-category{margin-top:18px;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.1em}.modal-copy h2{margin:7px 0 12px;font-family:Georgia,serif;font-size:42px;font-weight:500;letter-spacing:-.04em}.modal-price{display:flex;gap:9px;align-items:baseline}.modal-price strong{font-size:17px}.modal-price del{color:var(--muted);font-size:10px}.modal-copy>p{margin:24px 0;color:var(--muted);font-size:11px;line-height:1.7}.stock-note{padding:8px 10px;border-radius:999px;background:#e5f3e7;font-size:8px;font-weight:800}.modal-add{width:100%;min-height:54px;margin-top:auto;border:0;border-radius:999px;background:var(--ink);color:#fff;font-size:11px;font-weight:850;cursor:pointer}.modal-copy>small{width:100%;margin-top:9px;color:var(--muted);font-size:7px;text-align:center}.toast{position:fixed;left:50%;bottom:24px;z-index:100;padding:12px 17px;border-radius:999px;background:var(--ink);color:#fff;font-size:9px;font-weight:800;opacity:0;transform:translate(-50%,18px);transition:.2s;pointer-events:none}.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:1050px){.product-grid{grid-template-columns:repeat(3,1fr)}.hero{grid-template-columns:1fr}.hero-copy{max-width:760px}.site-header nav{display:none}.site-header{grid-template-columns:1fr auto}.trust-strip{grid-template-columns:1fr}.trust-strip>div{padding:18px 0;border-left:0;border-bottom:1px solid var(--line)}.trust-strip>div:last-child{border-bottom:0}.value-section{grid-template-columns:1fr}.modal-grid{grid-template-columns:1fr}.modal-copy{padding:10px}.modal-gallery{min-height:0}}
@media(max-width:680px){.announcement{font-size:7px;min-height:30px}.site-header{height:66px;padding:0 18px}.brand{font-size:20px}.language-switch{display:flex}.search-button{display:none}.cart-button{width:42px;padding:0;justify-content:center}.cart-button>span{display:none}.cart-button b{background:transparent;color:var(--ink);width:auto}.search-panel{top:96px;padding:10px 18px}.hero{padding:50px 18px 45px;gap:35px}.hero h1{font-size:clamp(46px,14vw,66px)}.hero-actions{flex-direction:column;align-items:flex-start}.primary-button{width:100%}.hero-stage{min-height:370px;margin:0 -24px}.hero-card{width:67%;border-radius:22px}.trust-strip{margin:0 18px}.shop-section{padding:80px 18px 90px}.section-heading{grid-template-columns:1fr;gap:20px}.section-heading h2{font-size:48px}.catalog-toolbar{margin-top:34px}.result-count{display:none}.product-grid{grid-template-columns:1fr 1fr;gap:28px 10px}.product-image-wrap,.product-media{border-radius:15px}.product-media{aspect-ratio:1}.badge{top:7px;left:7px;padding:5px 6px;font-size:5px}.quick-add{right:7px;bottom:7px;width:34px;height:34px}.product-meta{font-size:6px}.product-info h3{font-size:11px}.value-section{margin:0 18px;padding:58px 22px 24px;border-radius:24px}.value-section h2{font-size:48px}.value-grid{grid-template-columns:1fr}.faq-section{padding:90px 18px}.faq-section h2{font-size:48px}footer{padding:54px 18px 20px}.footer-main{flex-direction:column;gap:28px}.footer-main p{text-align:left}.footer-links{justify-content:start}.footer-bottom{flex-direction:column;gap:8px}.cart-drawer{padding:20px 18px}.product-modal{width:calc(100vw - 18px);padding:10px;border-radius:20px}.modal-gallery{grid-template-columns:1fr 1fr}.modal-gallery img.main-image{height:270px}.modal-copy h2{font-size:34px}}
`;
document.head.appendChild(style);

app.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;font-family:system-ui;background:#f4f2ea;color:#0b0d0c"><strong>${esc(text('loading'))}</strong></div>`;
await loadCatalog();
renderShell();
