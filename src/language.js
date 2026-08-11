import './showcase.js';

const STORAGE_KEY = 'virello-language';
const supportedLanguages = new Set(['de', 'en']);
let currentLanguage = supportedLanguages.has(localStorage.getItem(STORAGE_KEY))
  ? localStorage.getItem(STORAGE_KEY)
  : 'de';

const replacements = [
  ['Kostenloser Versand ab 49 €', 'Free shipping from €49'],
  ['30 Tage Rückgabe', '30-day returns'],
  ['VIRELLO Startseite', 'VIRELLO homepage'],
  ['Hauptnavigation', 'Main navigation'],
  ['Warum Virello', 'Why Virello'],
  ['Suche öffnen', 'Open search'],
  ['Suche schließen', 'Close search'],
  ['Produkte suchen …', 'Search products …'],
  ['Warenkorb öffnen', 'Open cart'],
  ['Warenkorb schließen', 'Close cart'],
  ['Warenkorb', 'Cart'],
  ['Produkte, die deinen Alltag', 'Products that make everyday life'],
  ['einfacher', 'easier'],
  ['Ausgewählte Produkte für Zuhause, unterwegs und dein tägliches Setup — klar kuratiert, ohne unnötigen Schnickschnack.', 'Curated products for home, travel and your everyday setup — clearly selected without unnecessary clutter.'],
  ['Produkte entdecken', 'Explore products'],
  ['Smart ausgewählt', 'Smart selection'],
  ['Für Nutzen, Design & Alltag', 'Chosen for utility, design & daily life'],
  ['Ausgewählte Produkte', 'Featured products'],
  ['Kompakt. Praktisch. Bereit.', 'Compact. Practical. Ready.'],
  ['Shop Vorteile', 'Store benefits'],
  ['Schneller Versand', 'Fast shipping'],
  ['Klare Lieferinfos', 'Clear delivery information'],
  ['Sicher einkaufen', 'Shop securely'],
  ['Transparenter Checkout', 'Transparent checkout'],
  ['Einfach & unkompliziert', 'Simple & straightforward'],
  ['Flexible Zahlung', 'Flexible payment'],
  ['Checkout-ready Struktur', 'Checkout-ready structure'],
  ['Unsere Auswahl', 'Our selection'],
  ['Finde deinen nächsten', 'Find your next'],
  ['Alltagshelfer.', 'everyday essential.'],
  ['Ein fokussiertes Sortiment mit Produkten, die sich leicht verstehen, zeigen und verkaufen lassen.', 'A focused collection of products that are easy to understand, showcase and sell.'],
  ['Produktkategorien', 'Product categories'],
  ['Keine Produkte gefunden.', 'No products found.'],
  ['Versuche einen anderen Suchbegriff oder eine andere Kategorie.', 'Try another search term or category.'],
  ['Weniger suchen.', 'Search less.'],
  ['Besser auswählen.', 'Choose better.'],
  ['Unser Shop ist auf klare Produktkommunikation, mobile Conversion und ein vertrauenswürdiges Einkaufserlebnis ausgelegt.', 'Our store is built around clear product communication, mobile conversion and a trustworthy shopping experience.'],
  ['Jetzt entdecken', 'Explore now'],
  ['Praktischer Nutzen', 'Practical value'],
  ['Produkte mit einem leicht verständlichen Problem-Lösungs-Versprechen.', 'Products with a clear and easy-to-understand problem-solution promise.'],
  ['Saubere Auswahl', 'Clean selection'],
  ['Ein kuratiertes Sortiment statt eines überladenen Gemischtwarenladens.', 'A curated collection instead of an overloaded general store.'],
  ['Entwickelt für Käufer, die Produkte hauptsächlich am Smartphone entdecken.', 'Designed for customers who mainly discover products on their smartphones.'],
  ['Skalierbar', 'Scalable'],
  ['Produkte, Kategorien und Inhalte lassen sich direkt im Katalog erweitern.', 'Products, categories and content can be expanded directly in the catalogue.'],
  ['Deals, Neuheiten & praktische Finds.', 'Deals, new arrivals & practical finds.'],
  ['Deine E-Mail-Adresse', 'Your email address'],
  ['E-Mail-Adresse', 'Email address'],
  ['Anmelden', 'Sign up'],
  ['Gut zu', 'Good to'],
  ['wissen.', 'know.'],
  ['Wie lange dauert der Versand?', 'How long does shipping take?'],
  ['Die finalen Lieferzeiten werden pro Produkt hinterlegt, sobald der jeweilige Lieferant und das Versandlager verifiziert sind.', 'Final delivery times will be shown per product once the relevant supplier and shipping warehouse have been verified.'],
  ['Woher werden die Produkte versendet?', 'Where are the products shipped from?'],
  ['Die Versandherkunft wird vor dem Livegang je Produkt mit dem tatsächlichen Lieferanten verknüpft und transparent angezeigt.', 'Before launch, each product will be linked to its actual supplier and shipping origin, which will be shown transparently.'],
  ['Kann ich Produkte zurückgeben?', 'Can I return products?'],
  ['Die finale Rückgaberichtlinie wird vor Verkaufsstart an Händler-, Zahlungs- und Lieferprozess angepasst.', 'The final return policy will be aligned with the merchant, payment and fulfilment process before sales begin.'],
  ['Welche Zahlungsmethoden gibt es?', 'Which payment methods are available?'],
  ['Das Frontend ist für die spätere Anbindung eines echten Checkout- und Zahlungsanbieters vorbereitet.', 'The frontend is prepared for a real checkout and payment-provider integration before launch.'],
  ['Alle Produkte', 'All products'],
  ['Neuheiten', 'New arrivals'],
  ['Hilfe', 'Help'],
  ['Versand', 'Shipping'],
  ['Rückgabe', 'Returns'],
  ['Rechtliches', 'Legal'],
  ['Datenschutz', 'Privacy'],
  ['AGB', 'Terms'],
  ['Deine Auswahl', 'Your selection'],
  ['Dein Warenkorb ist leer.', 'Your cart is empty.'],
  ['Entdecke unsere ausgewählten Produkte.', 'Explore our selected products.'],
  ['Weiter shoppen', 'Continue shopping'],
  ['Zwischensumme', 'Subtotal'],
  ['Versand und Steuern werden im echten Checkout berechnet.', 'Shipping and taxes will be calculated in the real checkout.'],
  ['Zur Kasse', 'Checkout'],
  ['Checkout-Integration folgt vor Livegang.', 'Checkout integration will be added before launch.'],
  ['Menge reduzieren', 'Decrease quantity'],
  ['Menge erhöhen', 'Increase quantity'],
  ['Produkt schließen', 'Close product'],
  ['Bewertungen', 'reviews'],
  ['In den Warenkorb', 'Add to cart'],
  ['Demo-Produkt — Lieferant, Bestand und finale Produktdaten vor Livegang verifizieren.', 'Demo product — verify supplier, stock and final product data before launch.'],
  ['Echter Checkout wird vor dem Livegang integriert.', 'Real checkout will be integrated before launch.'],
  ['Danke — Formular-Demo erfolgreich.', 'Thanks — demo form submitted successfully.'],
  ['Kompakter Luftreiniger für Tastaturen, Auto und schwer erreichbare Stellen.', 'Compact air cleaner for keyboards, cars and hard-to-reach areas.'],
  ['Kabellos & wiederaufladbar', 'Cordless & rechargeable'],
  ['Kompaktes Format', 'Compact format'],
  ['Mehrere Einsatzbereiche', 'Multiple use cases'],
  ['Wiederverwendbarer Tierhaarentferner für Sofa, Kleidung, Bett und Auto.', 'Reusable pet-hair remover for sofas, clothes, beds and car interiors.'],
  ['Ohne Kleberollen', 'No sticky refills'],
  ['Schnell zu reinigen', 'Quick to clean'],
  ['Für viele Stoffoberflächen', 'Works on many fabrics'],
  ['Minimalistische Sensorleuchte für Schrank, Flur, Treppe oder Küche.', 'Minimalist motion-sensor light for closets, hallways, stairs or kitchens.'],
  ['Bewegungssensor', 'Motion sensor'],
  ['Magnetische Montage', 'Magnetic mounting'],
  ['Warmweißes Licht', 'Warm white light'],
  ['Kompakte magnetische Smartphone-Halterung für einen aufgeräumten Innenraum.', 'Compact magnetic smartphone mount for a clean and organised car interior.'],
  ['Starker Magnet', 'Strong magnet'],
  ['360° verstellbar', '360° adjustable'],
  ['Einhand-Bedienung', 'One-hand operation'],
  ['Platzsparendes Pack-Set für Koffer, Wochenendtrip und saisonale Aufbewahrung.', 'Space-saving packing set for suitcases, weekend trips and seasonal storage.'],
  ['Mehr Ordnung', 'Better organisation'],
  ['Wiederverwendbar', 'Reusable'],
  ['Ideal für Reisen', 'Ideal for travel'],
  ['Dezente Kabelhalter für Schreibtisch, Nachttisch und Homeoffice.', 'Minimal cable holders for desks, bedside tables and home-office setups.'],
  ['Sauberes Setup', 'Cleaner setup'],
  ['Schnelle Montage', 'Quick installation'],
  ['Mehrfach verwendbar', 'Reusable'],
  ['Haustiere', 'Pets'],
  ['Zuhause', 'Home'],
  ['Reise', 'Travel'],
  ['Auto', 'Car'],
  ['Alle', 'All'],
  ['Beliebt', 'Popular'],
  ['Neu', 'New'],
  ['Top Wahl', 'Top Pick'],
  ['Reise-Favorit', 'Travel Favourite']
].sort((a, b) => b[0].length - a[0].length);

const textOriginals = new WeakMap();
const attributeOriginals = new WeakMap();
const translatableAttributes = ['aria-label', 'placeholder', 'title'];
let observer;

const translateGermanToEnglish = (value) => {
  let result = value;

  for (const [german, english] of replacements) {
    result = result.split(german).join(english);
  }

  result = result.replace(/(\d+) Produkte\b/g, '$1 products');
  result = result.replace(/([A-Za-z0-9+ .-]+) wurde hinzugefügt\./g, '$1 was added.');
  result = result.replace(/(\d+) Bewertungen\b/g, '$1 reviews');
  result = result.replace(/(\d+),(\d{2})\s€\b/g, '€$1.$2');

  return result;
};

const translateTextNode = (node) => {
  if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
  const original = textOriginals.get(node);
  node.nodeValue = currentLanguage === 'en' ? translateGermanToEnglish(original) : original;
};

const translateAttributes = (element) => {
  if (element.closest('[data-no-translate]')) return;

  let originals = attributeOriginals.get(element);
  if (!originals) {
    originals = {};
    attributeOriginals.set(element, originals);
  }

  for (const attribute of translatableAttributes) {
    if (!element.hasAttribute(attribute)) continue;
    if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
    element.setAttribute(
      attribute,
      currentLanguage === 'en' ? translateGermanToEnglish(originals[attribute]) : originals[attribute]
    );
  }
};

const translateTree = (root = document.body) => {
  if (!root) return;

  observer?.disconnect();

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root);
  } else if (root.nodeType === Node.ELEMENT_NODE) {
    if (!root.closest('[data-no-translate]')) {
      translateAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node = walker.currentNode;
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node);
        node = walker.nextNode();
      }
    }
  }

  observer?.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatableAttributes });
};

const updateLanguageButtons = () => {
  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const applyLanguage = (language) => {
  if (!supportedLanguages.has(language)) return;
  currentLanguage = language;
  localStorage.setItem(STORAGE_KEY, currentLanguage);
  document.documentElement.lang = currentLanguage;
  translateTree(document.body);
  updateLanguageButtons();
};

const createLanguageSwitch = () => {
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions || headerActions.querySelector('.language-switch')) return;

  const switcher = document.createElement('div');
  switcher.className = 'language-switch';
  switcher.dataset.noTranslate = 'true';
  switcher.setAttribute('aria-label', 'Language');
  switcher.innerHTML = `
    <button class="language-option" type="button" data-language="de" aria-pressed="false">DE</button>
    <button class="language-option" type="button" data-language="en" aria-pressed="false">EN</button>
  `;

  headerActions.insertBefore(switcher, headerActions.firstChild);

  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-language]');
    if (!button) return;
    applyLanguage(button.dataset.language);
  });
};

const addLanguageStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .language-switch {
      height: 42px;
      padding: 3px;
      display: flex;
      border: 1px solid rgba(11,13,12,.12);
      border-radius: 999px;
      flex: 0 0 auto;
    }

    .language-option {
      min-width: 32px;
      padding: 0 8px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #686a65;
      font-size: 9px;
      font-weight: 850;
      letter-spacing: .05em;
      cursor: pointer;
    }

    .language-option.active {
      background: #0b0d0c;
      color: #fff;
    }

    @media (max-width: 680px) {
      .header-actions { gap: 5px; }
      .language-switch { height: 38px; padding: 2px; }
      .language-option { min-width: 27px; padding: 0 6px; font-size: 8px; }
      .icon-button, .cart-button { width: 38px; height: 38px; }
    }
  `;
  document.head.appendChild(style);
};

const englishSearchTerms = new Map([
  ['pets', 'Haustiere'],
  ['pet', 'Tier'],
  ['home', 'Zuhause'],
  ['car', 'Auto'],
  ['travel', 'Reise'],
  ['light', 'Leuchte'],
  ['motion', 'Bewegung'],
  ['cable', 'Kabel'],
  ['cleaner', 'Luftreiniger'],
  ['keyboard', 'Tastatur'],
  ['phone', 'Smartphone'],
  ['mount', 'Halterung']
]);

const mapEnglishSearchToGerman = (query) => {
  let mapped = query;
  for (const [english, german] of englishSearchTerms) {
    mapped = mapped.replace(new RegExp(`\\b${english}\\b`, 'gi'), german);
  }
  return mapped;
};

const enableEnglishSearch = () => {
  const searchInput = document.getElementById('site-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    if (currentLanguage !== 'en' || searchInput.dataset.languageSearch === 'mapped') return;

    const visibleValue = event.target.value;
    const mappedValue = mapEnglishSearchToGerman(visibleValue);
    if (mappedValue === visibleValue) return;

    searchInput.dataset.languageSearch = 'mapped';
    searchInput.value = mappedValue;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.value = visibleValue;
    delete searchInput.dataset.languageSearch;
  });
};

addLanguageStyles();
createLanguageSwitch();
enableEnglishSearch();

observer = new MutationObserver((mutations) => {
  observer.disconnect();
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translateTree(node);
      });
    } else if (mutation.type === 'characterData') {
      translateTextNode(mutation.target);
    } else if (mutation.type === 'attributes') {
      translateAttributes(mutation.target);
    }
  }
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatableAttributes });
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatableAttributes });
applyLanguage(currentLanguage);
