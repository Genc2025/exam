const euro = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
};

let economicsMap = new Map();

async function loadEconomics() {
  try {
    const response = await fetch(`./data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const feed = await response.json();
    economicsMap = new Map((feed.products || []).map((product) => [String(product.id), product]));
    decorateCards();
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
    const id = String(card.dataset.product || '');
    const product = economicsMap.get(id);
    if (!product) return;
    const info = card.querySelector('.product-info');
    if (!info) return;
    info.querySelector('.econ-box, .econ-status')?.remove();
    info.insertAdjacentHTML('beforeend', economicsMarkup(product));
  });
}

function decorateModal(id) {
  const product = economicsMap.get(String(id));
  if (!product) return;
  setTimeout(() => {
    const modalCopy = document.querySelector('.product-modal .modal-copy');
    if (!modalCopy) return;
    modalCopy.querySelector('.econ-box, .econ-status')?.remove();
    const button = modalCopy.querySelector('.modal-add');
    if (button) button.insertAdjacentHTML('beforebegin', economicsMarkup(product));
    else modalCopy.insertAdjacentHTML('beforeend', economicsMarkup(product));
  }, 40);
}

document.addEventListener('click', (event) => {
  const productNode = event.target.closest?.('[data-product]');
  if (productNode?.dataset?.product) decorateModal(productNode.dataset.product);
});

const observer = new MutationObserver(() => decorateCards());
observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });

await loadEconomics();
