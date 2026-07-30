const CLEAN_KEY = 'exam-hall-clean-v1';

const style = document.createElement('style');
style.textContent = `
  :root {
    --clean-border: rgba(53,84,109,.55);
  }

  #premium-launcher,
  #enterprise-launcher,
  #insights-launcher,
  #immersion-launcher,
  #foundation-focus-btn {
    display: none !important;
  }

  [data-premium-dashboard-card],
  [data-insights-dashboard-card],
  [data-enterprise-strip],
  [data-foundation-band],
  [data-foundation-dashboard-enhancer],
  [data-foundation-session-summary],
  [data-analytics-injected],
  [data-ux-hero],
  [data-ux-session-tools] {
    display: none !important;
  }

  .topbar {
    grid-template-columns: auto 1fr auto;
  }

  .clean-tools {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .clean-tools-btn {
    min-height: 42px;
    padding: 0 14px;
    border: 1px solid var(--clean-border);
    border-radius: 14px;
    background: rgba(255,255,255,.04);
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
  }

  .clean-tools-popover {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 280px;
    padding: 10px;
    border: 1px solid var(--clean-border);
    border-radius: 18px;
    background: rgba(11,24,38,.98);
    box-shadow: 0 18px 55px rgba(0,0,0,.34);
    display: none;
    z-index: 120;
  }

  .clean-tools-popover.open { display: grid; gap: 8px; }

  .clean-tools-popover .clean-item {
    width: 100%;
    text-align: left;
    padding: 11px 12px;
    border: 1px solid #233648;
    border-radius: 14px;
    background: rgba(255,255,255,.03);
    color: #eef4fb;
  }

  .clean-tools-popover .clean-item strong {
    display: block;
    font-size: 13px;
    margin-bottom: 3px;
  }

  .clean-tools-popover .clean-item span {
    color: #95a8bd;
    font-size: 11px;
    line-height: 1.35;
  }

  .clean-mini-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .clean-mini-card {
    padding: 14px;
    border: 1px solid rgba(53,84,109,.55);
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }

  .clean-mini-card .k {
    font-size: 11px;
    color: #9eb1c1;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .clean-mini-card .v {
    margin-top: 8px;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .clean-mini-card .s {
    margin-top: 4px;
    color: #aab9c8;
    font-size: 12px;
  }

  .clean-tip {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid rgba(53,84,109,.55);
    background: rgba(141,210,255,.07);
    color: #d9e8f4;
    font-size: 12px;
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .clean-mini-strip { grid-template-columns: 1fr; }
    .clean-tools-popover {
      left: 0;
      right: auto;
      width: min(320px, 84vw);
    }
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

function readPrefs() {
  try {
    const raw = localStorage.getItem(CLEAN_KEY);
    return raw ? JSON.parse(raw) : { seenTip: false };
  } catch {
    return { seenTip: false };
  }
}

function writePrefs(next) {
  localStorage.setItem(CLEAN_KEY, JSON.stringify(next));
}

let prefs = readPrefs();

function ensureTools() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  if (topbar.querySelector('.clean-tools')) return;

  const wrap = document.createElement('div');
  wrap.className = 'clean-tools';
  wrap.innerHTML = `
    <button class="clean-tools-btn" id="clean-tools-btn">Study Tools</button>
    <div class="clean-tools-popover" id="clean-tools-popover">
      <button class="clean-item" data-clean-action="dashboard"><strong>Dashboard</strong><span>Go back to the main overview.</span></button>
      <button class="clean-item" data-clean-action="practice"><strong>Practice</strong><span>Open the question bank drill.</span></button>
      <button class="clean-item" data-clean-action="exam"><strong>Immersive Exam</strong><span>Launch the full-screen simulator.</span></button>
      <button class="clean-item" data-clean-action="analytics"><strong>Analytics</strong><span>Open performance insights.</span></button>
      <button class="clean-item" data-clean-action="premium"><strong>More tools</strong><span>Open premium bookmarks and export tools.</span></button>
    </div>
  `;
  topbar.appendChild(wrap);

  wrap.querySelector('#clean-tools-btn')?.addEventListener('click', () => {
    wrap.querySelector('#clean-tools-popover')?.classList.toggle('open');
  });
}

function closePopover() {
  document.querySelector('#clean-tools-popover')?.classList.remove('open');
}

function actions() {
  return {
    dashboard: () => document.querySelector('[data-tab="dashboard"]')?.click(),
    practice: () => document.querySelector('[data-tab="practice"]')?.click(),
    exam: () => document.querySelector('#immersion-launcher')?.click(),
    analytics: () => document.querySelector('#insights-launcher')?.click(),
    premium: () => document.querySelector('#premium-launcher')?.click(),
  };
}

function injectMiniStrip() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('[data-clean-strip]')) return;
  const state = loadState();
  const last = Array.isArray(state.examHistory) ? state.examHistory[0] : null;
  const strip = document.createElement('div');
  strip.setAttribute('data-clean-strip', 'true');
  strip.innerHTML = `
    <div class="clean-mini-strip">
      <div class="clean-mini-card"><div class="k">Readiness</div><div class="v">${Math.min(100, Math.round(((state.completedLessons?.length || 0) / 9) * 100)) || 0}%</div><div class="s">Based on lessons completed.</div></div>
      <div class="clean-mini-card"><div class="k">Latest score</div><div class="v">${last ? `${last.score}%` : '—'}</div><div class="s">Your most recent mock exam.</div></div>
      <div class="clean-mini-card"><div class="k">Saved</div><div class="v">${state.savedQuestions?.length || 0}</div><div class="s">Questions bookmarked for review.</div></div>
    </div>
  `;
  hero.insertBefore(strip, hero.children[2] || null);
}

function injectTip() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('[data-clean-tip]')) return;
  const tip = document.createElement('div');
  tip.setAttribute('data-clean-tip', 'true');
  tip.className = 'clean-tip';
  tip.textContent = prefs.seenTip ? 'Tip: press Ctrl+K for fast navigation.' : 'Tip: use Study Tools for a cleaner experience, and press Ctrl+K for fast navigation.';
  hero.appendChild(tip);
  if (!prefs.seenTip) {
    prefs.seenTip = true;
    writePrefs(prefs);
  }
}

function injectSessionHint() {
  const panel = document.querySelector('#tabArea');
  if (!panel || !panel.textContent.includes('Session History')) return;
  if (panel.querySelector('[data-clean-session-hint]')) return;
  const state = loadState();
  const hint = document.createElement('div');
  hint.setAttribute('data-clean-session-hint', 'true');
  hint.className = 'clean-tip';
  hint.innerHTML = `
    Session summary is stored locally. Recent runs: <strong>${Array.isArray(state.examHistory) ? state.examHistory.length : 0}</strong>.
  `;
  panel.insertBefore(hint, panel.children[2] || null);
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-clean-action]')?.dataset.cleanAction;
    if (!action) return;
    actions()[action]?.();
    closePopover();
  });

  document.addEventListener('click', (event) => {
    const pop = document.querySelector('#clean-tools-popover');
    const tools = document.querySelector('.clean-tools');
    if (!pop || !tools) return;
    if (!tools.contains(event.target)) pop.classList.remove('open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePopover();
  });
}

function boot() {
  ensureTools();
  injectMiniStrip();
  injectTip();
  injectSessionHint();
  bindEvents();
  setInterval(() => {
    ensureTools();
    injectMiniStrip();
    injectTip();
    injectSessionHint();
  }, 1200);
}

boot();
