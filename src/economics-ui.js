const euro = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
};

let economicsMap = new Map();
let cardsDecorationScheduled = false;

async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadEconomics() {
  try {
    const feed = await fetchJsonWithTimeout(`./data/products.json?v=${Date.now()}`);
    economicsMap = new Map((feed.products || []).map((product) => [String(product.id), product]));
    scheduleCardDecoration();
  } catch (error) {
    console.warn('Demo economics unavailable:', error);
  }
}

function economicsMarkup(product) {
  const e = product?.economics;
  if (!e) return '<div class="econ-status">Economics sync pending</div>';

  const supplier = e?.representativeVariant?.supplierCostEur;
  if (e.status !== 'freight-verified-demo') {
    return `<div class="econ-status"><b>DEMO COST</b><span>Produkt ${euro(supplier)}</span><span>Transport: noch nicht von CJ berechnet</span></div>`;
  }

  return `<div class="econ-box">
    <div class="econ-head"><span>INTERNAL DEMO</span><b>${e.marketValidatedCompetitivePrice ? 'MARKET VERIFIED' : 'PRICE MODEL'}</b></div>
    <div class="econ-line"><span>Produkt bei CJ</span><strong>${euro(supplier)}</strong></div>
    <div class="econ-line"><span>Versand → DE</span><strong>${euro(e?.freight?.shippingEur)}</strong></div>
    <div class="econ-line"><span>Landed Cost</span><strong>${euro(e.landedCostEur)}</strong></div>
    <div class="econ-line"><span>Preisvorschlag</span><strong>${euro(e.suggestedSellingPriceEur)}</strong></div>
    <div class="econ-line"><span>VAT Reserve</span><strong>${euro(e.vatReserveEur)}</strong></div>
    <div class="econ-line"><span>Payment Reserve</span><strong>${euro(e.paymentFeeReserveEur)}</strong></div>
    <div class="econ-profit"><span>Gewinn vor Ads</span><strong>${euro(e.estimatedProfitBeforeAdsEur)}</strong></div>
    <div class="econ-break"><span>Break-even Ads</span><strong>${euro(e.breakEvenAdSpendEur)}</strong></div>
    <small>${e?.freight?.logisticsName || 'CJ freight'}${e?.freight?.deliveryDays ? ` · ${e.freight.deliveryDays} Tage` : ''} · Demo DE 10115</small>
  </div>`;
}

function decorateCards() {
  document.querySelectorAll('.product-card[data-product]').forEach((card) => {
    // Never remove/reinsert an existing economics block. Doing so from a MutationObserver
    // causes a self-triggering DOM mutation loop on Safari/mobile browsers.
    if (card.querySelector('.econ-box, .econ-status')) return;

    const id = String(card.dataset.product || '');
    const product = economicsMap.get(id);
    if (!product) return;

    const info = card.querySelector('.product-info');
    if (!info) return;
    info.insertAdjacentHTML('beforeend', economicsMarkup(product));
  });
}

function scheduleCardDecoration() {
  if (cardsDecorationScheduled) return;
  cardsDecorationScheduled = true;
  requestAnimationFrame(() => {
    cardsDecorationScheduled = false;
    decorateCards();
  });
}

function decorateModal(id) {
  const product = economicsMap.get(String(id));
  if (!product) return;
  setTimeout(() => {
    const modalCopy = document.querySelector('.product-modal .modal-copy');
    if (!modalCopy || modalCopy.querySelector('.econ-box, .econ-status')) return;
    const button = modalCopy.querySelector('.modal-add');
    if (button) button.insertAdjacentHTML('beforebegin', economicsMarkup(product));
    else modalCopy.insertAdjacentHTML('beforeend', economicsMarkup(product));
  }, 40);
}

document.addEventListener('click', (event) => {
  const productNode = event.target.closest?.('[data-product]');
  if (productNode?.dataset?.product) decorateModal(productNode.dataset.product);
});

const app = document.getElementById('app');
if (app) {
  const observer = new MutationObserver(() => scheduleCardDecoration());
  observer.observe(app, { childList: true, subtree: true });
}

loadEconomics();
