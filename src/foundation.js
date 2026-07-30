const FOUNDATION_KEY = 'exam-hall-foundation-v1';

const style = document.createElement('style');
style.textContent = `
  :root {
    --shell: rgba(11, 24, 38, 0.76);
    --shell-border: rgba(53, 84, 109, 0.72);
    --radius-xl: 30px;
    --radius-lg: 22px;
    --radius-md: 16px;
  }

  html, body {
    background:
      radial-gradient(circle at top left, rgba(141,210,255,0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(121,255,168,0.10), transparent 26%),
      radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 20%),
      linear-gradient(180deg, #07111a 0%, #07111a 100%);
  }

  body { color: #eef4fb; }

  .app {
    max-width: 1460px;
    padding: 20px 20px 110px;
  }

  .topbar {
    position: sticky;
    top: 14px;
    z-index: 70;
    padding: 14px 16px;
    border: 1px solid var(--shell-border);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(10,18,28,0.90), rgba(10,18,28,0.68));
    backdrop-filter: blur(18px);
    box-shadow: 0 18px 55px rgba(0,0,0,.24);
  }

  .brand h1 {
    font-size: 20px;
    letter-spacing: -0.04em;
  }

  .brand p { color: #a8b9c9; }

  .topbar .pill {
    background: rgba(255,255,255,.04);
    border-color: rgba(53,84,109,.8);
    color: #c6d7e5;
  }

  .topbar::after {
    content: 'Exam Hall';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 16px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(53,84,109,.75);
    background: rgba(255,255,255,.03);
    color: #dce9f4;
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .layout {
    grid-template-columns: 272px minmax(0, 1fr);
    gap: 20px;
    margin-top: 18px;
  }

  .side {
    top: 92px;
    border-radius: 28px;
    padding: 16px;
    background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
  }

  .navbtn {
    border-radius: 18px;
    padding: 13px 14px;
    transition: transform .18s ease, background .18s ease, border-color .18s ease;
  }

  .navbtn:hover {
    transform: translateX(2px);
  }

  .hero {
    border-radius: var(--radius-xl);
    padding: 26px;
    border-color: rgba(53,84,109,.7);
    background: linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
  }

  .hero h2 {
    font-size: clamp(32px, 4.1vw, 54px);
    line-height: .98;
    max-width: 900px;
  }

  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .card,
  .panel,
  .item,
  .reportBox,
  .sessionCard {
    border-radius: 24px;
    border-color: rgba(53,84,109,.65);
    background: linear-gradient(180deg, rgba(10,18,28,.90), rgba(10,18,28,.80));
    box-shadow: 0 18px 55px rgba(0,0,0,.20);
  }

  .panel h3,
  .hero h2,
  .reportBox h4 {
    letter-spacing: -0.03em;
  }

  .grid2 {
    grid-template-columns: 1.2fr .8fr;
    gap: 20px;
  }

  .item p, .sub, .meta, .small, .premium-meta, .enterprise-meta {
    color: #aab9c8;
  }

  .btn,
  .ux-icon-btn,
  .premium-chip,
  .premium-tab,
  .enterprise-tab,
  .badge,
  .tag {
    transition: transform .16s ease, background .16s ease, border-color .16s ease;
  }

  .btn:hover,
  .ux-icon-btn:hover,
  .premium-chip:hover,
  .premium-tab:hover,
  .enterprise-tab:hover,
  .badge:hover,
  .tag:hover {
    transform: translateY(-1px);
  }

  .card .v {
    font-size: 30px;
  }

  .meter,
  .bar-track,
  .chart-track {
    height: 12px;
  }

  .footerbar {
    border-top-left-radius: 22px;
    border-top-right-radius: 22px;
    left: 50%;
    width: min(1460px, 100%);
  }

  body.exam-focus .layout {
    grid-template-columns: 1fr;
  }

  body.exam-focus .side,
  body.exam-focus .enterprise-launcher,
  body.exam-focus .premium-launcher {
    display: none !important;
  }

  body.exam-focus .grid2 {
    grid-template-columns: 1fr;
  }

  body.exam-focus .hero,
  body.exam-focus .topbar {
    max-width: none;
  }

  body.exam-focus .hero {
    border-color: rgba(121,255,168,.28);
    box-shadow: 0 20px 80px rgba(0,0,0,.28);
  }

  .foundation-bar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 14px;
  }

  .foundation-pill {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(53,84,109,.75);
    background: rgba(255,255,255,.04);
    color: #d9e4ef;
    font-size: 11px;
    letter-spacing: .02em;
  }

  .foundation-band {
    margin-top: 14px;
    padding: 16px;
    border-radius: 24px;
    border: 1px solid rgba(53,84,109,.65);
    background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  }

  .foundation-band h4 {
    margin: 0 0 10px;
    font-size: 15px;
    letter-spacing: -.03em;
  }

  .foundation-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .foundation-card {
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(53,84,109,.65);
    background: rgba(255,255,255,.03);
  }

  .foundation-card .k {
    font-size: 11px;
    color: #9eb1c1;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .foundation-card .v {
    margin-top: 8px;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .foundation-card .s {
    margin-top: 4px;
    color: #aab9c8;
    font-size: 12px;
    line-height: 1.45;
  }

  @media (max-width: 1180px) {
    .foundation-grid,
    .metrics,
    .enterprise-grid,
    .enterprise-split,
    .pricing-grid,
    .enterprise-kpis,
    .legend-box {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 1060px) {
    .layout { grid-template-columns: 1fr; }
    .topbar::after { display: none; }
    .topbar { position: static; }
    .side { display: none; }
    body.exam-focus .side { display: none !important; }
  }
`;
document.head.appendChild(style);

function loadState() {
  try {
    const raw = localStorage.getItem('exam-hall-state-v4') || localStorage.getItem('exam-hall-state-v3') || localStorage.getItem('exam-hall-state-v2') || localStorage.getItem('exam-hall-state-v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function detectMode() {
  const active = document.querySelector('.navbtn.active strong')?.textContent || '';
  const tab = active.toLowerCase();
  document.body.classList.toggle('exam-focus', tab.includes('mock exam') || tab.includes('exam'));
}

function injectFoundationBand() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('[data-foundation-band]')) return;

  const state = loadState();
  const latest = Array.isArray(state.examHistory) ? state.examHistory[0] : null;
  const band = document.createElement('div');
  band.setAttribute('data-foundation-band', 'true');
  band.className = 'foundation-band';
  band.innerHTML = `
    <h4>Product overview</h4>
    <div class="foundation-grid">
      <div class="foundation-card"><div class="k">Readiness</div><div class="v">${Math.min(100, Math.max(0, Math.round(((state.completedLessons?.length || 0) / 9) * 100))) || 0}%</div><div class="s">Learning completion signal based on lessons finished.</div></div>
      <div class="foundation-card"><div class="k">Latest exam</div><div class="v">${latest ? `${latest.score}%` : '—'}</div><div class="s">Most recent stored mock exam score.</div></div>
      <div class="foundation-card"><div class="k">Saved items</div><div class="v">${state.savedQuestions?.length || 0}</div><div class="s">Questions available in bookmark review.</div></div>
    </div>
    <div class="foundation-bar">
      <span class="foundation-pill">Dashboard 2.0</span>
      <span class="foundation-pill">Exam engine</span>
      <span class="foundation-pill">Analytics</span>
      <span class="foundation-pill">Premium center</span>
      <span class="foundation-pill">Enterprise control</span>
    </div>
  `;
  hero.insertBefore(band, hero.children[2] || null);
}

function injectFocusButton() {
  if (document.querySelector('#foundation-focus-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'foundation-focus-btn';
  btn.className = 'premium-launcher';
  btn.style.left = '18px';
  btn.style.right = 'auto';
  btn.style.bottom = '18px';
  btn.textContent = 'Focus Mode';
  btn.addEventListener('click', () => {
    document.body.classList.toggle('exam-focus');
  });
  document.body.appendChild(btn);
}

function injectSessionSummary() {
  const panel = document.querySelector('#tabArea');
  if (!panel || !panel.textContent.includes('Session History')) return;
  if (panel.querySelector('[data-foundation-session-summary]')) return;
  const state = loadState();
  const sessions = Array.isArray(state.examHistory) ? state.examHistory : [];
  const latest = sessions[0];
  const summary = document.createElement('div');
  summary.setAttribute('data-foundation-session-summary', 'true');
  summary.className = 'foundation-band';
  summary.innerHTML = `
    <h4>Session summary</h4>
    <div class="foundation-grid">
      <div class="foundation-card"><div class="k">Sessions</div><div class="v">${sessions.length}</div><div class="s">Stored mock exam attempts.</div></div>
      <div class="foundation-card"><div class="k">Last score</div><div class="v">${latest ? `${latest.score}%` : '—'}</div><div class="s">Latest score on the current device.</div></div>
      <div class="foundation-card"><div class="k">Goal</div><div class="v">${state.goal || 80}%</div><div class="s">Current target threshold.</div></div>
    </div>
  `;
  panel.insertBefore(summary, panel.children[2] || null);
}

function injectDashboardEnhancer() {
  const panel = document.querySelector('#tabArea');
  if (!panel || !panel.textContent.includes('Dashboard')) return;
  if (panel.querySelector('[data-foundation-dashboard-enhancer]')) return;
  const state = loadState();
  const last = Array.isArray(state.examHistory) ? state.examHistory[0] : null;
  const enhancer = document.createElement('div');
  enhancer.setAttribute('data-foundation-dashboard-enhancer', 'true');
  enhancer.className = 'foundation-band';
  enhancer.innerHTML = `
    <h4>Quick command surface</h4>
    <div class="foundation-grid">
      <div class="foundation-card"><div class="k">Current mode</div><div class="v">Dashboard</div><div class="s">A cleaner overview with high-contrast cards and stronger spacing.</div></div>
      <div class="foundation-card"><div class="k">Latest run</div><div class="v">${last ? `${last.score}%` : '—'}</div><div class="s">Latest mock exam trend snapshot.</div></div>
      <div class="foundation-card"><div class="k">Next step</div><div class="v">Practice</div><div class="s">Use the command palette or the quick actions in the hero band.</div></div>
    </div>
  `;
  panel.insertBefore(enhancer, panel.children[2] || null);
}

function refresh() {
  detectMode();
  injectFoundationBand();
  injectDashboardEnhancer();
  injectSessionSummary();
  injectFocusButton();
}

function boot() {
  refresh();
  setInterval(refresh, 1200);
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, { childList: true, subtree: true });
}

boot();
