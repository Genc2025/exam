const app = document.getElementById('app');

const products = [
  {
    id: 'air-duster',
    name: 'AirJet Mini',
    category: 'Tech',
    price: 39.90,
    compareAt: 54.90,
    rating: 4.8,
    reviews: 184,
    badge: 'Bestseller',
    icon: 'wind',
    tone: 'lime',
    description: 'Kompakter Luftreiniger für Tastaturen, Auto und schwer erreichbare Stellen.',
    benefits: ['Kabellos & wiederaufladbar', 'Kompaktes Format', 'Mehrere Einsatzbereiche']
  },
  {
    id: 'pet-roller',
    name: 'PawClean Roller',
    category: 'Haustiere',
    price: 24.90,
    compareAt: 34.90,
    rating: 4.7,
    reviews: 263,
    badge: 'Beliebt',
    icon: 'paw',
    tone: 'sand',
    description: 'Wiederverwendbarer Tierhaarentferner für Sofa, Kleidung, Bett und Auto.',
    benefits: ['Ohne Kleberollen', 'Schnell zu reinigen', 'Für viele Stoffoberflächen']
  },
  {
    id: 'motion-light',
    name: 'LumaSense Light',
    category: 'Zuhause',
    price: 29.90,
    compareAt: 39.90,
    rating: 4.9,
    reviews: 118,
    badge: 'Neu',
    icon: 'light',
    tone: 'cream',
    description: 'Minimalistische Sensorleuchte für Schrank, Flur, Treppe oder Küche.',
    benefits: ['Bewegungssensor', 'Magnetische Montage', 'Warmweißes Licht']
  },
  {
    id: 'car-mount',
    name: 'DriveSnap Mount',
    category: 'Auto',
    price: 27.90,
    compareAt: 37.90,
    rating: 4.8,
    reviews: 207,
    badge: 'Top Wahl',
    icon: 'phone',
    tone: 'blue',
    description: 'Kompakte magnetische Smartphone-Halterung für einen aufgeräumten Innenraum.',
    benefits: ['Starker Magnet', '360° verstellbar', 'Einhand-Bedienung']
  },
  {
    id: 'travel-bags',
    name: 'PackMore Set',
    category: 'Reise',
    price: 32.90,
    compareAt: 44.90,
    rating: 4.6,
    reviews: 91,
    badge: 'Reise-Favorit',
    icon: 'bag',
    tone: 'rose',
    description: 'Platzsparendes Pack-Set für Koffer, Wochenendtrip und saisonale Aufbewahrung.',
    benefits: ['Mehr Ordnung', 'Wiederverwendbar', 'Ideal für Reisen']
  },
  {
    id: 'cable-organizer',
    name: 'DeskDock Clips',
    category: 'Tech',
    price: 19.90,
    compareAt: 27.90,
    rating: 4.7,
    reviews: 156,
    badge: 'Smart Buy',
    icon: 'cable',
    tone: 'violet',
    description: 'Dezente Kabelhalter für Schreibtisch, Nachttisch und Homeoffice.',
    benefits: ['Sauberes Setup', 'Schnelle Montage', 'Mehrfach verwendbar']
  }
];

const categories = ['Alle', ...new Set(products.map((product) => product.category))];
const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

let activeCategory = 'Alle';
let searchTerm = '';
let cart = JSON.parse(localStorage.getItem('virello-cart') || '{}');

const iconMarkup = (name) => {
  const icons = {
    wind: '<path d="M4 9h10.5a2.5 2.5 0 1 0-2.2-3.7"/><path d="M4 14h14a2 2 0 1 1-1.7 3"/><path d="M4 19h7"/>',
    paw: '<circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M8.5 18.5c1.8-3 5.2-3 7 0 1.3 2.2-.6 3.5-3.5 3.5s-4.8-1.3-3.5-3.5Z"/>',
    light: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.3 14.7A7 7 0 1 1 15.7 14.7C14.6 15.5 14 16.4 14 18h-4c0-1.6-.6-2.5-1.7-3.3Z"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/><path d="M4 8h3M17 8h3"/>',
    bag: '<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    cable: '<path d="M7 3v4a5 5 0 0 0 5 5h1a4 4 0 0 1 4 4v5"/><path d="M4 3h6M14 21h6"/>'
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.bag}</svg>`;
};

const productVisual = (product, large = false) => `
  <div class="product-visual tone-${product.tone} ${large ? 'product-visual-large' : ''}">
    <div class="visual-glow"></div>
    <div class="visual-icon">${iconMarkup(product.icon)}</div>
    <span class="visual-label">VIRELLO / ${product.category.toUpperCase()}</span>
  </div>
`;

const saveCart = () => {
  localStorage.setItem('virello-cart', JSON.stringify(cart));
};

const cartCount = () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

const cartTotal = () => products.reduce((sum, product) => sum + (cart[product.id] || 0) * product.price, 0);

app.innerHTML = `
  <div class="site-shell">
    <div class="announcement">Kostenloser Versand ab 49 € <span></span> 30 Tage Rückgabe</div>

    <header class="site-header">
      <a class="brand" href="#top" aria-label="VIRELLO Startseite">VIRELLO<span>®</span></a>
      <nav class="desktop-nav" aria-label="Hauptnavigation">
        <a href="#shop">Shop</a>
        <a href="#why-us">Warum Virello</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="header-actions">
        <button class="icon-button search-toggle" type="button" aria-label="Suche öffnen">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        </button>
        <button class="cart-button" type="button" aria-label="Warenkorb öffnen">
          <span>Warenkorb</span>
          <b class="cart-count">0</b>
        </button>
      </div>
    </header>

    <div class="search-panel" hidden>
      <div class="search-inner">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        <input id="site-search" type="search" placeholder="Produkte suchen …" autocomplete="off">
        <button class="search-close" type="button" aria-label="Suche schließen">×</button>
      </div>
    </div>

    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">Better everyday essentials</div>
          <h1>Produkte, die deinen Alltag <em>einfacher</em> machen.</h1>
          <p>Ausgewählte Produkte für Zuhause, unterwegs und dein tägliches Setup — klar kuratiert, ohne unnötigen Schnickschnack.</p>
          <div class="hero-actions">
            <a class="primary-button" href="#shop">Produkte entdecken</a>
            <a class="text-link" href="#why-us">Warum Virello <span>↗</span></a>
          </div>
          <div class="hero-proof">
            <div class="avatar-stack"><i>V</i><i>R</i><i>+</i></div>
            <div><strong>Smart ausgewählt</strong><span>Für Nutzen, Design & Alltag</span></div>
          </div>
        </div>

        <div class="hero-stage" aria-label="Ausgewählte Produkte">
          <div class="hero-orbit orbit-one"></div>
          <div class="hero-orbit orbit-two"></div>
          <div class="hero-product-card hero-main-card">
            ${productVisual(products[0], true)}
            <div class="hero-card-copy"><span>Bestseller</span><strong>AirJet Mini</strong></div>
          </div>
          <div class="floating-tag tag-top"><span>★</span> 4.8 / 5</div>
          <div class="floating-tag tag-bottom">Kompakt. Praktisch. Bereit.</div>
        </div>
      </section>

      <section class="trust-strip" aria-label="Shop Vorteile">
        <div><svg viewBox="0 0 24 24"><path d="M3 7h12v10H3z"/><path d="M15 10h3l3 3v4h-6z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg><span><strong>Schneller Versand</strong><small>Klare Lieferinfos</small></span></div>
        <div><svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg><span><strong>Sicher einkaufen</strong><small>Transparenter Checkout</small></span></div>
        <div><svg viewBox="0 0 24 24"><path d="M4 8h12a4 4 0 0 1 4 4v1"/><path d="m17 10 3 3-3 3"/><path d="M20 16H8a4 4 0 0 1-4-4v-1"/></svg><span><strong>30 Tage Rückgabe</strong><small>Einfach & unkompliziert</small></span></div>
        <div><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M4 9h16"/><path d="M8 15h4"/></svg><span><strong>Flexible Zahlung</strong><small>Checkout-ready Struktur</small></span></div>
      </section>

      <section class="shop-section" id="shop">
        <div class="section-heading">
          <div>
            <span class="eyebrow">Unsere Auswahl</span>
            <h2>Finde deinen nächsten <em>Alltagshelfer.</em></h2>
          </div>
          <p>Ein fokussiertes Sortiment mit Produkten, die sich leicht verstehen, zeigen und verkaufen lassen.</p>
        </div>

        <div class="catalog-toolbar">
          <div class="category-list" role="tablist" aria-label="Produktkategorien">
            ${categories.map((category, index) => `<button type="button" data-category="${category}" class="category-chip ${index === 0 ? 'active' : ''}">${category}</button>`).join('')}
          </div>
          <span class="result-count"></span>
        </div>

        <div class="product-grid"></div>
        <div class="empty-state" hidden>
          <strong>Keine Produkte gefunden.</strong>
          <span>Versuche einen anderen Suchbegriff oder eine andere Kategorie.</span>
        </div>
      </section>

      <section class="value-section" id="why-us">
        <div class="value-copy">
          <span class="eyebrow">Warum Virello</span>
          <h2>Weniger suchen.<br><em>Besser auswählen.</em></h2>
          <p>Unser Shop ist auf klare Produktkommunikation, mobile Conversion und ein vertrauenswürdiges Einkaufserlebnis ausgelegt.</p>
          <a href="#shop" class="secondary-button">Jetzt entdecken</a>
        </div>
        <div class="value-grid">
          <article><span>01</span><div class="mini-icon">${iconMarkup('light')}</div><h3>Praktischer Nutzen</h3><p>Produkte mit einem leicht verständlichen Problem-Lösungs-Versprechen.</p></article>
          <article><span>02</span><div class="mini-icon">${iconMarkup('bag')}</div><h3>Saubere Auswahl</h3><p>Ein kuratiertes Sortiment statt eines überladenen Gemischtwarenladens.</p></article>
          <article><span>03</span><div class="mini-icon">${iconMarkup('phone')}</div><h3>Mobile first</h3><p>Entwickelt für Käufer, die Produkte hauptsächlich am Smartphone entdecken.</p></article>
          <article><span>04</span><div class="mini-icon">${iconMarkup('cable')}</div><h3>Skalierbar</h3><p>Produkte, Kategorien und Inhalte lassen sich direkt im Katalog erweitern.</p></article>
        </div>
      </section>

      <section class="newsletter-section">
        <div><span class="eyebrow">Virello Updates</span><h2>Deals, Neuheiten & praktische Finds.</h2></div>
        <form class="newsletter-form">
          <input type="email" placeholder="Deine E-Mail-Adresse" aria-label="E-Mail-Adresse" required>
          <button type="submit">Anmelden <span>→</span></button>
        </form>
      </section>

      <section class="faq-section" id="faq">
        <div class="section-heading compact"><div><span class="eyebrow">FAQ</span><h2>Gut zu <em>wissen.</em></h2></div></div>
        <div class="faq-list">
          <details><summary>Wie lange dauert der Versand?<span>+</span></summary><p>Die finalen Lieferzeiten werden pro Produkt hinterlegt, sobald der jeweilige Lieferant und das Versandlager verifiziert sind.</p></details>
          <details><summary>Woher werden die Produkte versendet?<span>+</span></summary><p>Die Versandherkunft wird vor dem Livegang je Produkt mit dem tatsächlichen Lieferanten verknüpft und transparent angezeigt.</p></details>
          <details><summary>Kann ich Produkte zurückgeben?<span>+</span></summary><p>Die finale Rückgaberichtlinie wird vor Verkaufsstart an Händler-, Zahlungs- und Lieferprozess angepasst.</p></details>
          <details><summary>Welche Zahlungsmethoden gibt es?<span>+</span></summary><p>Das Frontend ist für die spätere Anbindung eines echten Checkout- und Zahlungsanbieters vorbereitet.</p></details>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-top">
        <a class="brand footer-brand" href="#top">VIRELLO<span>®</span></a>
        <p>Everyday products,<br>better chosen.</p>
      </div>
      <div class="footer-grid">
        <div><strong>Shop</strong><a href="#shop">Alle Produkte</a><a href="#shop">Bestseller</a><a href="#shop">Neuheiten</a></div>
        <div><strong>Hilfe</strong><a href="#faq">FAQ</a><a href="#faq">Versand</a><a href="#faq">Rückgabe</a></div>
        <div><strong>Rechtliches</strong><a href="#">Impressum</a><a href="#">Datenschutz</a><a href="#">AGB</a></div>
      </div>
      <div class="footer-bottom"><span>© 2026 VIRELLO</span><span>Store preview · Demo catalog</span></div>
    </footer>
  </div>

  <div class="drawer-backdrop" hidden></div>
  <aside class="cart-drawer" aria-hidden="true">
    <div class="drawer-head"><div><span class="eyebrow">Deine Auswahl</span><h2>Warenkorb</h2></div><button class="drawer-close" type="button" aria-label="Warenkorb schließen">×</button></div>
    <div class="cart-items"></div>
    <div class="cart-empty" hidden><div class="empty-bag">${iconMarkup('bag')}</div><strong>Dein Warenkorb ist leer.</strong><span>Entdecke unsere ausgewählten Produkte.</span><button type="button" class="secondary-button cart-shop-button">Weiter shoppen</button></div>
    <div class="cart-summary">
      <div><span>Zwischensumme</span><strong class="cart-total">0,00 €</strong></div>
      <small>Versand und Steuern werden im echten Checkout berechnet.</small>
      <button class="checkout-button" type="button">Zur Kasse <span>→</span></button>
      <div class="checkout-note">Checkout-Integration folgt vor Livegang.</div>
    </div>
  </aside>

  <div class="modal-backdrop" hidden></div>
  <div class="product-modal" role="dialog" aria-modal="true" aria-hidden="true"></div>
  <div class="toast" role="status" aria-live="polite"></div>
`;

const style = document.createElement('style');
style.textContent = `
  :root {
    --ink: #0b0d0c;
    --paper: #f4f2ea;
    --soft: #ebe8dd;
    --card: #fbfaf6;
    --line: rgba(11,13,12,.12);
    --muted: #686a65;
    --accent: #d9ff43;
    --accent-dark: #b6de22;
    --white: #fff;
    --radius: 26px;
    --shadow: 0 24px 70px rgba(11,13,12,.12);
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  body.locked { overflow: hidden; }
  button, input { font: inherit; }
  button, a { -webkit-tap-highlight-color: transparent; }
  button { color: inherit; }
  a { color: inherit; text-decoration: none; }
  svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

  .site-shell { max-width: 1600px; margin: 0 auto; overflow: hidden; }
  .announcement { min-height: 34px; padding: 8px 20px; display: flex; align-items: center; justify-content: center; gap: 12px; background: var(--ink); color: #f7f7f2; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
  .announcement span { width: 3px; height: 3px; border-radius: 50%; background: var(--accent); }

  .site-header { height: 78px; padding: 0 5vw; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid var(--line); background: rgba(244,242,234,.92); backdrop-filter: blur(18px); position: relative; z-index: 40; }
  .brand { justify-self: start; font-weight: 950; letter-spacing: -.06em; font-size: 23px; }
  .brand span { font-size: 8px; vertical-align: top; margin-left: 3px; letter-spacing: 0; }
  .desktop-nav { display: flex; gap: 30px; font-size: 13px; font-weight: 650; }
  .desktop-nav a { position: relative; }
  .desktop-nav a::after { content: ""; position: absolute; left: 0; right: 100%; bottom: -5px; height: 1px; background: var(--ink); transition: right .2s ease; }
  .desktop-nav a:hover::after { right: 0; }
  .header-actions { justify-self: end; display: flex; align-items: center; gap: 8px; }
  .icon-button, .cart-button { border: 1px solid var(--line); background: transparent; height: 42px; border-radius: 999px; cursor: pointer; transition: .2s ease; }
  .icon-button { width: 42px; display: grid; place-items: center; }
  .icon-button svg { width: 18px; }
  .cart-button { padding: 0 7px 0 17px; display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 750; }
  .cart-count { width: 28px; height: 28px; border-radius: 50%; background: var(--ink); color: var(--white); display: grid; place-items: center; font-size: 10px; }
  .icon-button:hover, .cart-button:hover { background: var(--white); transform: translateY(-1px); }

  .search-panel { position: absolute; top: 112px; left: 0; right: 0; z-index: 35; padding: 14px 5vw; background: var(--paper); border-bottom: 1px solid var(--line); box-shadow: 0 18px 30px rgba(11,13,12,.06); }
  .search-inner { max-width: 900px; margin: 0 auto; height: 60px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--ink); }
  .search-inner svg { width: 20px; flex: 0 0 auto; }
  .search-inner input { flex: 1; border: 0; outline: 0; background: transparent; font-size: 18px; min-width: 0; }
  .search-close { width: 38px; height: 38px; border: 0; background: transparent; font-size: 28px; cursor: pointer; }

  .hero { min-height: 700px; padding: 82px 5vw 68px; display: grid; grid-template-columns: minmax(0, .95fr) minmax(440px, 1.05fr); gap: 6vw; align-items: center; }
  .hero-copy { max-width: 670px; }
  .eyebrow { display: block; margin-bottom: 16px; font-size: 10px; line-height: 1; font-weight: 850; letter-spacing: .15em; text-transform: uppercase; color: var(--muted); }
  .hero h1, .section-heading h2, .value-copy h2, .newsletter-section h2, .faq-section h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(48px, 5.8vw, 88px); font-weight: 500; line-height: .95; letter-spacing: -.055em; }
  h1 em, h2 em { font-weight: 400; }
  .hero-copy > p { max-width: 560px; margin: 28px 0 0; color: var(--muted); font-size: 16px; line-height: 1.7; }
  .hero-actions { margin-top: 34px; display: flex; align-items: center; gap: 22px; }
  .primary-button, .secondary-button, .checkout-button { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 24px; border-radius: 999px; border: 1px solid var(--ink); background: var(--ink); color: var(--white); font-size: 12px; font-weight: 800; cursor: pointer; transition: .2s ease; }
  .primary-button:hover, .checkout-button:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(11,13,12,.15); }
  .text-link { font-size: 13px; font-weight: 750; }
  .text-link span { margin-left: 4px; }
  .hero-proof { display: flex; align-items: center; gap: 12px; margin-top: 46px; }
  .avatar-stack { display: flex; }
  .avatar-stack i { width: 32px; height: 32px; margin-left: -7px; border: 2px solid var(--paper); border-radius: 50%; background: var(--ink); color: var(--white); display: grid; place-items: center; font-size: 9px; font-style: normal; font-weight: 800; }
  .avatar-stack i:first-child { margin-left: 0; background: var(--accent); color: var(--ink); }
  .avatar-stack i:nth-child(2) { background: #d6cec0; color: var(--ink); }
  .hero-proof div:last-child { display: flex; flex-direction: column; gap: 3px; }
  .hero-proof strong { font-size: 11px; }
  .hero-proof span { font-size: 10px; color: var(--muted); }

  .hero-stage { min-height: 510px; position: relative; display: grid; place-items: center; isolation: isolate; }
  .hero-stage::before { content: ""; position: absolute; width: 76%; aspect-ratio: 1; border-radius: 50%; background: var(--accent); filter: blur(.1px); z-index: -3; }
  .hero-orbit { position: absolute; border: 1px solid rgba(11,13,12,.16); border-radius: 50%; z-index: -2; }
  .orbit-one { width: 92%; aspect-ratio: 1; transform: rotate(12deg) scaleY(.58); }
  .orbit-two { width: 72%; aspect-ratio: 1; transform: rotate(-35deg) scaleY(.76); }
  .hero-product-card { width: min(390px, 68%); padding: 12px; border-radius: 28px; background: rgba(255,255,255,.88); box-shadow: var(--shadow); transform: rotate(-5deg); }
  .hero-card-copy { padding: 14px 10px 9px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .hero-card-copy span { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
  .hero-card-copy strong { font-size: 13px; }
  .floating-tag { position: absolute; z-index: 2; border: 1px solid rgba(11,13,12,.1); background: rgba(255,255,255,.88); backdrop-filter: blur(14px); border-radius: 999px; padding: 11px 15px; box-shadow: 0 12px 30px rgba(11,13,12,.1); font-size: 11px; font-weight: 800; }
  .tag-top { top: 12%; right: 4%; transform: rotate(5deg); }
  .tag-top span { color: #d0a500; }
  .tag-bottom { bottom: 13%; left: 0; transform: rotate(-4deg); }

  .product-visual { position: relative; aspect-ratio: 1 / .82; border-radius: 20px; overflow: hidden; display: grid; place-items: center; color: var(--ink); }
  .product-visual-large { aspect-ratio: 1 / .9; }
  .tone-lime { background: linear-gradient(145deg, #dfff64, #bded33); }
  .tone-sand { background: linear-gradient(145deg, #eadfcd, #cdbba2); }
  .tone-cream { background: linear-gradient(145deg, #fff5d9, #eadfb7); }
  .tone-blue { background: linear-gradient(145deg, #d7eaff, #a7c8eb); }
  .tone-rose { background: linear-gradient(145deg, #f4d7d7, #dcb6b9); }
  .tone-violet { background: linear-gradient(145deg, #ddd5ff, #bdb0ef); }
  .visual-glow { width: 58%; aspect-ratio: 1; position: absolute; border-radius: 50%; background: rgba(255,255,255,.52); filter: blur(28px); }
  .visual-icon { width: 34%; aspect-ratio: 1; border-radius: 30%; background: rgba(255,255,255,.72); border: 1px solid rgba(11,13,12,.08); display: grid; place-items: center; transform: rotate(-7deg); box-shadow: 0 20px 35px rgba(11,13,12,.11); position: relative; }
  .visual-icon svg { width: 47%; height: 47%; stroke-width: 1.5; }
  .visual-label { position: absolute; bottom: 13px; left: 14px; font-size: 8px; font-weight: 850; letter-spacing: .12em; opacity: .55; }

  .trust-strip { margin: 0 5vw; padding: 24px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); display: grid; grid-template-columns: repeat(4, 1fr); }
  .trust-strip > div { padding: 0 24px; display: flex; align-items: center; gap: 13px; border-left: 1px solid var(--line); }
  .trust-strip > div:first-child { border-left: 0; padding-left: 0; }
  .trust-strip svg { width: 24px; flex: 0 0 auto; }
  .trust-strip span { display: flex; flex-direction: column; gap: 3px; }
  .trust-strip strong { font-size: 11px; }
  .trust-strip small { color: var(--muted); font-size: 9px; }

  .shop-section { padding: 112px 5vw 124px; }
  .section-heading { display: grid; grid-template-columns: 1.15fr .65fr; gap: 8vw; align-items: end; }
  .section-heading h2 { font-size: clamp(44px, 5vw, 72px); }
  .section-heading > p { margin: 0 0 5px; max-width: 440px; color: var(--muted); line-height: 1.7; font-size: 14px; }
  .catalog-toolbar { margin-top: 52px; min-height: 52px; display: flex; justify-content: space-between; gap: 18px; align-items: center; border-bottom: 1px solid var(--line); }
  .category-list { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .category-list::-webkit-scrollbar { display: none; }
  .category-chip { border: 0; background: transparent; border-radius: 999px; padding: 10px 14px; color: var(--muted); font-size: 11px; font-weight: 750; white-space: nowrap; cursor: pointer; }
  .category-chip.active { background: var(--ink); color: var(--white); }
  .result-count { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; white-space: nowrap; }
  .product-grid { margin-top: 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px 20px; }
  .product-card { min-width: 0; cursor: pointer; }
  .product-image-wrap { position: relative; overflow: hidden; border-radius: 22px; }
  .product-image-wrap .product-visual { transition: transform .45s cubic-bezier(.2,.7,.2,1); }
  .product-card:hover .product-visual { transform: scale(1.025); }
  .product-badge { position: absolute; top: 12px; left: 12px; z-index: 2; padding: 8px 10px; background: rgba(255,255,255,.86); backdrop-filter: blur(12px); border-radius: 999px; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
  .quick-add { position: absolute; right: 12px; bottom: 12px; width: 42px; height: 42px; border-radius: 50%; border: 0; background: var(--ink); color: var(--white); display: grid; place-items: center; font-size: 22px; cursor: pointer; transition: .2s ease; }
  .quick-add:hover { transform: scale(1.06); background: var(--accent); color: var(--ink); }
  .product-info { padding: 14px 3px 0; }
  .product-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--muted); font-size: 9px; }
  .product-rating { color: var(--ink); }
  .product-info h3 { margin: 7px 0 9px; font-size: 14px; font-weight: 760; }
  .price-row { display: flex; gap: 8px; align-items: baseline; }
  .price { font-size: 13px; font-weight: 820; }
  .compare-price { color: #90918c; font-size: 10px; text-decoration: line-through; }
  .empty-state { padding: 80px 20px; text-align: center; border-bottom: 1px solid var(--line); }
  .empty-state strong, .empty-state span { display: block; }
  .empty-state span { margin-top: 8px; color: var(--muted); font-size: 12px; }

  .value-section { margin: 0 5vw; padding: 100px 6vw; border-radius: 32px; background: var(--ink); color: var(--white); display: grid; grid-template-columns: .72fr 1.28fr; gap: 8vw; align-items: center; }
  .value-copy h2 { font-size: clamp(42px, 4.5vw, 68px); }
  .value-copy > p { margin: 26px 0 0; max-width: 430px; color: rgba(255,255,255,.58); font-size: 13px; line-height: 1.7; }
  .value-copy .eyebrow { color: rgba(255,255,255,.5); }
  .secondary-button { margin-top: 30px; background: var(--accent); border-color: var(--accent); color: var(--ink); }
  .secondary-button:hover { background: var(--white); border-color: var(--white); }
  .value-grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(255,255,255,.14); border-left: 1px solid rgba(255,255,255,.14); }
  .value-grid article { min-height: 230px; padding: 24px; position: relative; border-right: 1px solid rgba(255,255,255,.14); border-bottom: 1px solid rgba(255,255,255,.14); }
  .value-grid article > span { position: absolute; top: 20px; right: 20px; color: rgba(255,255,255,.34); font-size: 9px; }
  .mini-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px; background: rgba(255,255,255,.08); color: var(--accent); }
  .mini-icon svg { width: 20px; }
  .value-grid h3 { margin: 42px 0 8px; font-size: 14px; }
  .value-grid p { margin: 0; color: rgba(255,255,255,.52); font-size: 11px; line-height: 1.6; }

  .newsletter-section { margin: 120px 5vw 0; padding: 58px 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); display: grid; grid-template-columns: 1fr .75fr; align-items: end; gap: 7vw; }
  .newsletter-section h2 { font-size: clamp(36px, 4vw, 58px); }
  .newsletter-form { display: flex; border-bottom: 1px solid var(--ink); }
  .newsletter-form input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; padding: 17px 0; font-size: 13px; }
  .newsletter-form button { border: 0; background: transparent; font-size: 11px; font-weight: 850; cursor: pointer; }
  .newsletter-form button span { margin-left: 6px; }

  .faq-section { padding: 120px 5vw; }
  .section-heading.compact { display: block; max-width: 680px; }
  .faq-list { max-width: 900px; margin: 52px 0 0 auto; border-top: 1px solid var(--line); }
  .faq-list details { border-bottom: 1px solid var(--line); }
  .faq-list summary { list-style: none; padding: 22px 0; display: flex; justify-content: space-between; gap: 20px; cursor: pointer; font-size: 13px; font-weight: 750; }
  .faq-list summary::-webkit-details-marker { display: none; }
  .faq-list summary span { font-size: 20px; font-weight: 300; transition: transform .2s ease; }
  .faq-list details[open] summary span { transform: rotate(45deg); }
  .faq-list p { margin: -3px 0 22px; max-width: 650px; color: var(--muted); font-size: 12px; line-height: 1.7; }

  .site-footer { padding: 72px 5vw 24px; background: var(--ink); color: var(--white); }
  .footer-top { padding-bottom: 58px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.14); }
  .footer-brand { font-size: 34px; }
  .footer-top p { margin: 0; color: rgba(255,255,255,.5); font-family: Georgia, serif; font-size: 22px; line-height: 1.1; text-align: right; }
  .footer-grid { padding: 46px 0 60px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 650px; margin-left: auto; }
  .footer-grid > div { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; }
  .footer-grid strong { margin-bottom: 8px; color: rgba(255,255,255,.45); font-size: 9px; text-transform: uppercase; letter-spacing: .12em; }
  .footer-grid a { font-size: 11px; }
  .footer-bottom { padding-top: 18px; border-top: 1px solid rgba(255,255,255,.14); display: flex; justify-content: space-between; gap: 18px; color: rgba(255,255,255,.42); font-size: 8px; letter-spacing: .1em; text-transform: uppercase; }

  .drawer-backdrop, .modal-backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(11,13,12,.42); backdrop-filter: blur(4px); opacity: 0; transition: opacity .25s ease; }
  .drawer-backdrop.visible, .modal-backdrop.visible { opacity: 1; }
  .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 90; width: min(460px, 100vw); padding: 26px; background: var(--card); box-shadow: -20px 0 60px rgba(11,13,12,.15); transform: translateX(103%); transition: transform .3s cubic-bezier(.2,.7,.2,1); display: flex; flex-direction: column; }
  .cart-drawer.open { transform: translateX(0); }
  .drawer-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
  .drawer-head .eyebrow { margin-bottom: 7px; }
  .drawer-head h2 { margin: 0; font-family: Georgia, serif; font-size: 34px; font-weight: 500; letter-spacing: -.04em; }
  .drawer-close { width: 38px; height: 38px; border: 1px solid var(--line); border-radius: 50%; background: transparent; font-size: 24px; cursor: pointer; }
  .cart-items { overflow-y: auto; padding: 12px 0; }
  .cart-item { display: grid; grid-template-columns: 82px 1fr auto; gap: 13px; padding: 12px 0; border-bottom: 1px solid var(--line); align-items: center; }
  .cart-item .product-visual { border-radius: 13px; }
  .cart-item .visual-label { display: none; }
  .cart-item-main strong { display: block; font-size: 12px; }
  .cart-item-main > span { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; }
  .quantity-control { margin-top: 10px; display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: 999px; }
  .quantity-control button { width: 28px; height: 27px; border: 0; background: transparent; cursor: pointer; }
  .quantity-control span { min-width: 22px; text-align: center; font-size: 10px; }
  .cart-item-price { font-size: 11px; font-weight: 800; align-self: start; padding-top: 3px; }
  .cart-empty { flex: 1; padding: 60px 20px; display: grid; place-items: center; align-content: center; text-align: center; }
  .empty-bag { width: 72px; height: 72px; margin-bottom: 22px; display: grid; place-items: center; border-radius: 50%; background: var(--soft); }
  .cart-empty strong { font-size: 14px; }
  .cart-empty span { margin-top: 7px; color: var(--muted); font-size: 11px; }
  .cart-empty .secondary-button { margin-top: 20px; }
  .cart-summary { margin-top: auto; padding-top: 18px; border-top: 1px solid var(--line); }
  .cart-summary > div:first-child { display: flex; justify-content: space-between; gap: 20px; font-size: 13px; }
  .cart-summary small { display: block; margin: 8px 0 16px; color: var(--muted); font-size: 9px; }
  .checkout-button { width: 100%; background: var(--accent); border-color: var(--accent); color: var(--ink); }
  .checkout-button span { margin-left: 8px; }
  .checkout-note { margin-top: 9px; text-align: center; color: var(--muted); font-size: 8px; }

  .product-modal { position: fixed; left: 50%; top: 50%; z-index: 95; width: min(920px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow-y: auto; padding: 14px; border-radius: 30px; background: var(--card); box-shadow: var(--shadow); opacity: 0; transform: translate(-50%, -46%) scale(.98); pointer-events: none; transition: .25s ease; }
  .product-modal.open { opacity: 1; transform: translate(-50%, -50%) scale(1); pointer-events: auto; }
  .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  .modal-grid .product-visual { min-height: 500px; }
  .modal-copy { padding: 28px 26px 26px 0; display: flex; flex-direction: column; }
  .modal-close { align-self: flex-end; width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--line); background: transparent; font-size: 23px; cursor: pointer; }
  .modal-category { margin-top: 30px; color: var(--muted); font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; }
  .modal-copy h2 { margin: 8px 0 12px; font-family: Georgia, serif; font-size: 42px; font-weight: 500; letter-spacing: -.045em; }
  .modal-price { display: flex; gap: 9px; align-items: baseline; }
  .modal-price strong { font-size: 17px; }
  .modal-price del { color: var(--muted); font-size: 11px; }
  .modal-rating { margin-top: 12px; font-size: 10px; }
  .modal-description { margin: 25px 0 0; color: var(--muted); font-size: 12px; line-height: 1.7; }
  .benefit-list { margin: 24px 0 30px; padding: 0; list-style: none; display: grid; gap: 10px; }
  .benefit-list li { display: flex; align-items: center; gap: 9px; font-size: 11px; }
  .benefit-list li::before { content: "✓"; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); display: grid; place-items: center; font-size: 9px; font-weight: 900; }
  .modal-add { margin-top: auto; min-height: 54px; border: 0; border-radius: 999px; background: var(--ink); color: var(--white); font-weight: 800; font-size: 12px; cursor: pointer; }
  .modal-disclaimer { margin-top: 10px; color: var(--muted); text-align: center; font-size: 8px; }

  .toast { position: fixed; left: 50%; bottom: 24px; z-index: 120; min-width: 220px; max-width: calc(100vw - 32px); padding: 13px 18px; border-radius: 999px; background: var(--ink); color: var(--white); box-shadow: 0 15px 40px rgba(11,13,12,.22); font-size: 10px; font-weight: 750; text-align: center; opacity: 0; transform: translate(-50%, 20px); pointer-events: none; transition: .25s ease; }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }

  @media (max-width: 980px) {
    .desktop-nav { display: none; }
    .site-header { grid-template-columns: 1fr auto; }
    .hero { min-height: auto; padding-top: 60px; grid-template-columns: 1fr; gap: 56px; }
    .hero-copy { max-width: 760px; }
    .hero-stage { min-height: 520px; }
    .trust-strip { grid-template-columns: 1fr 1fr; }
    .trust-strip > div { padding: 18px 20px; border-bottom: 1px solid var(--line); }
    .trust-strip > div:nth-child(odd) { border-left: 0; }
    .trust-strip > div:nth-child(3), .trust-strip > div:nth-child(4) { border-bottom: 0; }
    .product-grid { grid-template-columns: repeat(2, 1fr); }
    .value-section { grid-template-columns: 1fr; }
    .newsletter-section { grid-template-columns: 1fr; align-items: start; }
  }

  @media (max-width: 680px) {
    .announcement { min-height: 30px; font-size: 8px; gap: 8px; }
    .site-header { height: 66px; padding: 0 18px; }
    .brand { font-size: 20px; }
    .cart-button { width: 42px; padding: 0; justify-content: center; }
    .cart-button > span { display: none; }
    .cart-count { background: transparent; color: var(--ink); width: auto; }
    .search-panel { top: 96px; padding: 10px 18px; }
    .hero { padding: 50px 18px 44px; gap: 40px; }
    .hero h1 { font-size: clamp(48px, 14vw, 67px); }
    .hero-copy > p { font-size: 14px; }
    .hero-actions { align-items: flex-start; flex-direction: column; gap: 18px; }
    .primary-button { width: 100%; }
    .hero-proof { margin-top: 34px; }
    .hero-stage { min-height: 390px; margin: 0 -25px; }
    .hero-product-card { width: 67%; border-radius: 23px; }
    .tag-top { right: 8px; }
    .tag-bottom { left: 8px; }
    .floating-tag { font-size: 9px; padding: 9px 11px; }
    .trust-strip { margin: 0 18px; grid-template-columns: 1fr; }
    .trust-strip > div { padding: 15px 0; border-left: 0; border-bottom: 1px solid var(--line) !important; }
    .trust-strip > div:last-child { border-bottom: 0 !important; }
    .shop-section { padding: 80px 18px 90px; }
    .section-heading { grid-template-columns: 1fr; gap: 20px; }
    .section-heading h2 { font-size: 48px; }
    .catalog-toolbar { margin-top: 36px; align-items: flex-end; }
    .result-count { display: none; }
    .product-grid { grid-template-columns: 1fr 1fr; gap: 28px 10px; }
    .product-image-wrap { border-radius: 16px; }
    .product-visual { border-radius: 16px; aspect-ratio: 1 / 1; }
    .product-badge { top: 8px; left: 8px; padding: 6px 7px; font-size: 6px; }
    .quick-add { right: 8px; bottom: 8px; width: 34px; height: 34px; font-size: 18px; }
    .product-meta { font-size: 7px; }
    .product-info h3 { margin: 6px 0 7px; font-size: 12px; }
    .price { font-size: 11px; }
    .compare-price { font-size: 8px; }
    .value-section { margin: 0 18px; padding: 60px 22px 24px; border-radius: 24px; gap: 48px; }
    .value-copy h2 { font-size: 48px; }
    .value-grid { grid-template-columns: 1fr; }
    .value-grid article { min-height: 190px; }
    .newsletter-section { margin: 88px 18px 0; padding: 42px 0; }
    .newsletter-section h2 { font-size: 42px; }
    .faq-section { padding: 90px 18px; }
    .faq-section h2 { font-size: 48px; }
    .faq-list { margin-top: 36px; }
    .site-footer { padding: 56px 18px 22px; }
    .footer-top { flex-direction: column; gap: 28px; }
    .footer-top p { text-align: left; }
    .footer-grid { grid-template-columns: repeat(2, 1fr); margin-left: 0; }
    .footer-bottom { flex-direction: column; }
    .cart-drawer { padding: 20px 18px; }
    .product-modal { width: calc(100vw - 20px); padding: 10px; border-radius: 22px; }
    .modal-grid { grid-template-columns: 1fr; gap: 0; }
    .modal-grid .product-visual { min-height: 300px; }
    .modal-copy { padding: 18px 10px 12px; }
    .modal-close { position: absolute; top: 20px; right: 20px; z-index: 3; background: rgba(255,255,255,.8); }
    .modal-category { margin-top: 4px; }
    .modal-copy h2 { font-size: 34px; }
  }
`;
document.head.appendChild(style);

const productGrid = document.querySelector('.product-grid');
const resultCount = document.querySelector('.result-count');
const emptyState = document.querySelector('.empty-state');
const cartCountElement = document.querySelector('.cart-count');
const cartDrawer = document.querySelector('.cart-drawer');
const drawerBackdrop = document.querySelector('.drawer-backdrop');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.cart-empty');
const cartSummary = document.querySelector('.cart-summary');
const cartTotalElement = document.querySelector('.cart-total');
const modalBackdrop = document.querySelector('.modal-backdrop');
const productModal = document.querySelector('.product-modal');
const toast = document.querySelector('.toast');
let toastTimer;

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

const renderProducts = () => {
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'Alle' || product.category === activeCategory;
    const searchableText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card" data-product-id="${product.id}" tabindex="0" aria-label="${product.name} ansehen">
      <div class="product-image-wrap">
        ${productVisual(product)}
        <span class="product-badge">${product.badge}</span>
        <button class="quick-add" type="button" data-add-id="${product.id}" aria-label="${product.name} in den Warenkorb">+</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${product.category}</span><span class="product-rating">★ ${product.rating} (${product.reviews})</span></div>
        <h3>${product.name}</h3>
        <div class="price-row"><span class="price">${currency.format(product.price)}</span><span class="compare-price">${currency.format(product.compareAt)}</span></div>
      </div>
    </article>
  `).join('');

  resultCount.textContent = `${filteredProducts.length} Produkte`;
  emptyState.hidden = filteredProducts.length !== 0;
};

const updateCartUI = () => {
  cartCountElement.textContent = cartCount();
  const cartProducts = products.filter((product) => cart[product.id] > 0);
  cartItems.innerHTML = cartProducts.map((product) => `
    <div class="cart-item">
      ${productVisual(product)}
      <div class="cart-item-main">
        <strong>${product.name}</strong>
        <span>${currency.format(product.price)}</span>
        <div class="quantity-control">
          <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Menge reduzieren">−</button>
          <span>${cart[product.id]}</span>
          <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Menge erhöhen">+</button>
        </div>
      </div>
      <span class="cart-item-price">${currency.format(product.price * cart[product.id])}</span>
    </div>
  `).join('');

  const isEmpty = cartProducts.length === 0;
  cartItems.hidden = isEmpty;
  cartEmpty.hidden = !isEmpty;
  cartSummary.hidden = isEmpty;
  cartTotalElement.textContent = currency.format(cartTotal());
  saveCart();
};

const addToCart = (productId, openCartAfter = false) => {
  cart[productId] = (cart[productId] || 0) + 1;
  updateCartUI();
  const product = products.find((item) => item.id === productId);
  showToast(`${product.name} wurde hinzugefügt.`);
  if (openCartAfter) openCart();
};

const changeQuantity = (productId, delta) => {
  cart[productId] = Math.max(0, (cart[productId] || 0) + delta);
  if (cart[productId] === 0) delete cart[productId];
  updateCartUI();
};

const openCart = () => {
  drawerBackdrop.hidden = false;
  requestAnimationFrame(() => {
    drawerBackdrop.classList.add('visible');
    cartDrawer.classList.add('open');
  });
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
};

const closeCart = () => {
  drawerBackdrop.classList.remove('visible');
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => { drawerBackdrop.hidden = true; }, 250);
  document.body.classList.remove('locked');
};

const openProductModal = (productId) => {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  productModal.innerHTML = `
    <div class="modal-grid">
      ${productVisual(product, true)}
      <div class="modal-copy">
        <button class="modal-close" type="button" aria-label="Produkt schließen">×</button>
        <span class="modal-category">${product.category} · ${product.badge}</span>
        <h2>${product.name}</h2>
        <div class="modal-price"><strong>${currency.format(product.price)}</strong><del>${currency.format(product.compareAt)}</del></div>
        <div class="modal-rating">★ ${product.rating} · ${product.reviews} Bewertungen</div>
        <p class="modal-description">${product.description}</p>
        <ul class="benefit-list">${product.benefits.map((benefit) => `<li>${benefit}</li>`).join('')}</ul>
        <button class="modal-add" type="button" data-modal-add="${product.id}">In den Warenkorb · ${currency.format(product.price)}</button>
        <div class="modal-disclaimer">Demo-Produkt — Lieferant, Bestand und finale Produktdaten vor Livegang verifizieren.</div>
      </div>
    </div>
  `;

  modalBackdrop.hidden = false;
  requestAnimationFrame(() => {
    modalBackdrop.classList.add('visible');
    productModal.classList.add('open');
  });
  productModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
};

const closeProductModal = () => {
  modalBackdrop.classList.remove('visible');
  productModal.classList.remove('open');
  productModal.setAttribute('aria-hidden', 'true');
  setTimeout(() => { modalBackdrop.hidden = true; }, 250);
  document.body.classList.remove('locked');
};

document.querySelectorAll('.category-chip').forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll('.category-chip').forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  });
});

document.querySelector('.search-toggle').addEventListener('click', () => {
  const panel = document.querySelector('.search-panel');
  panel.hidden = false;
  requestAnimationFrame(() => document.getElementById('site-search').focus());
});

document.querySelector('.search-close').addEventListener('click', () => {
  document.querySelector('.search-panel').hidden = true;
});

document.getElementById('site-search').addEventListener('input', (event) => {
  searchTerm = event.target.value;
  renderProducts();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

productGrid.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add-id]');
  if (addButton) {
    event.stopPropagation();
    addToCart(addButton.dataset.addId);
    return;
  }
  const card = event.target.closest('.product-card');
  if (card) openProductModal(card.dataset.productId);
});

productGrid.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('product-card')) {
    event.preventDefault();
    openProductModal(event.target.dataset.productId);
  }
});

document.querySelector('.cart-button').addEventListener('click', openCart);
document.querySelector('.drawer-close').addEventListener('click', closeCart);
document.querySelector('.cart-shop-button').addEventListener('click', closeCart);
drawerBackdrop.addEventListener('click', closeCart);

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const delta = button.dataset.cartAction === 'increase' ? 1 : -1;
  changeQuantity(button.dataset.productId, delta);
});

modalBackdrop.addEventListener('click', closeProductModal);
productModal.addEventListener('click', (event) => {
  if (event.target.closest('.modal-close')) closeProductModal();
  const addButton = event.target.closest('[data-modal-add]');
  if (addButton) {
    addToCart(addButton.dataset.modalAdd);
    closeProductModal();
  }
});

document.querySelector('.checkout-button').addEventListener('click', () => {
  showToast('Echter Checkout wird vor dem Livegang integriert.');
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast('Danke — Formular-Demo erfolgreich.');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (cartDrawer.classList.contains('open')) closeCart();
    if (productModal.classList.contains('open')) closeProductModal();
  }
});

renderProducts();
updateCartUI();
