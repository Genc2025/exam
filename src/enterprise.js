const MAIN_KEYS = ['exam-hall-state-v4', 'exam-hall-state-v3', 'exam-hall-state-v2', 'exam-hall-state-v1'];
const UX_KEY = 'exam-hall-ux-v1';
const AUTH_KEY = 'exam-hall-auth-v1';
const PREMIUM_KEY = 'exam-hall-premium-v3';

const style = document.createElement('style');
style.textContent = `
  .enterprise-launcher {
    position: fixed;
    left: 18px;
    bottom: 92px;
    z-index: 90;
    border: 1px solid #35546d;
    background: linear-gradient(145deg, rgba(121,255,168,.18), rgba(141,210,255,.16));
    color: #eef4fb;
    border-radius: 999px;
    padding: 12px 16px;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    backdrop-filter: blur(12px);
    font-weight: 800;
  }
  .enterprise-modal {
    position: fixed;
    inset: 0;
    z-index: 230;
    display: none;
    background: rgba(0,0,0,.6);
    backdrop-filter: blur(16px);
  }
  .enterprise-modal.open { display: grid; place-items: center; }
  .enterprise-shell {
    width: min(1280px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    border: 1px solid #35546d;
    border-radius: 30px;
    background: linear-gradient(180deg, #0b1826, #08111b);
    box-shadow: 0 30px 120px rgba(0,0,0,.55);
  }
  .enterprise-top {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 18px 20px;
    border-bottom: 1px solid #203346;
    background: rgba(10,18,28,.92);
    backdrop-filter: blur(18px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .enterprise-top h2 { margin: 0; font-size: 20px; }
  .enterprise-top p { margin: 4px 0 0; color: #95a8bd; font-size: 12px; }
  .enterprise-tabs { display:flex; gap:8px; flex-wrap:wrap; padding: 14px 20px 0; }
  .enterprise-tab {
    padding: 9px 12px;
    border-radius: 999px;
    border: 1px solid #2f516b;
    background: rgba(255,255,255,.03);
    color: #d9e4ef;
    font-size: 12px;
  }
  .enterprise-tab.active { background: rgba(141,210,255,.15); }
  .enterprise-content { padding: 18px 20px 20px; }
  .enterprise-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  .enterprise-card {
    padding: 16px;
    border: 1px solid #233648;
    border-radius: 20px;
    background: rgba(255,255,255,.03);
  }
  .enterprise-card h3 { margin: 0 0 10px; font-size: 16px; }
  .enterprise-card h4 { margin: 0 0 8px; font-size: 14px; }
  .enterprise-card p, .enterprise-meta { margin: 0; color: #c8d4e0; font-size: 13px; line-height: 1.5; }
  .enterprise-stack { display:grid; gap:12px; }
  .enterprise-kpis { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px; }
  .enterprise-kpi {
    padding: 14px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .enterprise-kpi .label { color: #95a8bd; font-size: 11px; }
  .enterprise-kpi .value { margin-top: 8px; font-size: 26px; font-weight: 800; letter-spacing: -.04em; }
  .enterprise-kpi .sub { margin-top: 4px; color: #c8d4e0; font-size: 12px; }
  .enterprise-split { display:grid; grid-template-columns: 1.15fr .85fr; gap:12px; }
  .pricing-grid { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
  .pricing-card {
    padding: 18px;
    border: 1px solid #233648;
    border-radius: 22px;
    background: rgba(255,255,255,.03);
  }
  .pricing-card.featured {
    border-color: #3f6784;
    background: linear-gradient(180deg, rgba(141,210,255,.12), rgba(255,255,255,.03));
  }
  .price { font-size: 34px; font-weight: 900; letter-spacing: -.05em; margin: 8px 0; }
  .price small { font-size: 14px; color: #95a8bd; font-weight: 600; }
  .pricing-list { display:grid; gap:8px; margin-top: 14px; }
  .pricing-list div { padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,.03); border: 1px solid #233648; font-size: 12px; color: #d9e4ef; }
  .bar-list { display:grid; gap:10px; }
  .bar-row { display:grid; grid-template-columns: 140px 1fr 58px; gap:10px; align-items:center; }
  .bar-track { height: 12px; border-radius: 999px; background: #102131; overflow:hidden; border:1px solid #24394d; }
  .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #8dd2ff, #79ffa8); }
  .bar-row .label { color:#95a8bd; font-size:12px; }
  .bar-row .score { text-align:right; color:#d9e4ef; font-size:12px; }
  .pillline { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
  .pillline span { padding: 6px 10px; border-radius: 999px; border: 1px solid #2e4a62; background: rgba(255,255,255,.04); color: #d9e4ef; font-size: 11px; }
  .legend-box { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px; }
  .legend-item { padding: 12px; border:1px solid #233648; border-radius: 16px; background: rgba(255,255,255,.03); }
  .legend-item .k { color: #95a8bd; font-size: 11px; }
  .legend-item .v { margin-top: 6px; font-size: 24px; font-weight: 800; }
  .enterprise-footer { padding: 14px 20px 20px; border-top: 1px solid #203346; display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }
  .mini-spark { width: 100%; overflow: hidden; border: 1px solid #233648; border-radius: 18px; background: rgba(255,255,255,.03); padding: 10px; }
  @media (max-width: 1100px) {
    .enterprise-grid, .enterprise-split, .pricing-grid, .enterprise-kpis, .legend-box { grid-template-columns: 1fr; }
    .bar-row { grid-template-columns: 1fr; }
    .bar-row .score { text-align:left; }
  }
`;
document.head.appendChild(style);

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getState() {
  for (const key of MAIN_KEYS) {
    const s = loadJson(key);
    if (s) return s;
  }
  return {};
}

function getAuth() {
  return loadJson(AUTH_KEY) || { unlocked: false, email: '', name: '' };
}

function getUx() {
  return loadJson(UX_KEY) || { theme: 'dark', sidebarCollapsed: false };
}

function getPremium() {
  return loadJson(PREMIUM_KEY) || { bookmarks: [], notes: {}, mode: 'overview' };
}

function sessions() { const s = getState(); return Array.isArray(s.examHistory) ? s.examHistory : []; }
function latest() { return sessions()[0] || null; }
function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }
function buildSpark(values, width = 620, height = 160) {
  if (!values.length) return `<div class="enterprise-meta">No data yet.</div>`;
  const safe = values.map((v) => Math.max(0, Math.min(100, Number(v) || 0)));
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = safe.map((v, i) => [i * step, height - ((v / 100) * (height - 20)) - 10]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none"><defs><linearGradient id="enterpriseGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8dd2ff"/><stop offset="100%" stop-color="#79ffa8"/></linearGradient></defs><path d="${d}" fill="none" stroke="url(#enterpriseGradient)" stroke-width="3"/></svg>`;
}

function ensureLauncher() {
  if (document.querySelector('#enterprise-launcher')) return;
  const btn = document.createElement('button');
  btn.id = 'enterprise-launcher';
  btn.className = 'enterprise-launcher';
  btn.textContent = 'Enterprise';
  btn.addEventListener('click', () => openModal('profile'));
  document.body.appendChild(btn);
}

function ensureModal() {
  if (document.querySelector('#enterprise-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'enterprise-modal';
  modal.className = 'enterprise-modal';
  modal.innerHTML = `
    <div class="enterprise-shell" role="dialog" aria-modal="true" aria-labelledby="enterprise-title">
      <div class="enterprise-top">
        <div>
          <div class="enterprise-meta">Enterprise Control Center</div>
          <h2 id="enterprise-title">Product-grade settings and analytics</h2>
          <p>Profile, pricing, and a full-width analytics console.</p>
        </div>
        <div class="premium-row">
          <button class="btn ghost" data-enterprise-action="profile">Profile</button>
          <button class="btn ghost" data-enterprise-action="pricing">Pricing</button>
          <button class="btn ghost" data-enterprise-action="analytics">Analytics</button>
          <button class="btn danger" data-enterprise-action="close">Close</button>
        </div>
      </div>
      <div class="enterprise-tabs" id="enterprise-tabs"></div>
      <div class="enterprise-content" id="enterprise-content"></div>
      <div class="enterprise-footer">
        <button class="btn ghost" data-enterprise-action="theme">Toggle theme</button>
        <button class="btn ghost" data-enterprise-action="sidebar">Toggle sidebar</button>
        <button class="btn warn" data-enterprise-action="reset">Reset UX data</button>
      </div>
    </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);
}

let activeTab = 'profile';

function openModal(tab = 'profile') {
  activeTab = tab;
  ensureModal();
  renderModal();
  document.querySelector('#enterprise-modal')?.classList.add('open');
}

function closeModal() {
  document.querySelector('#enterprise-modal')?.classList.remove('open');
}

function tabButtons() {
  const tabs = [['profile','Profile'],['pricing','Pricing'],['analytics','Analytics'],['settings','Settings']];
  return tabs.map(([id,label]) => `<button class="enterprise-tab ${activeTab===id?'active':''}" data-enterprise-tab="${id}">${label}</button>`).join('');
}

function profileView() {
  const s = getState();
  const a = getAuth();
  const p = getPremium();
  const last = latest();
  const bookmarkCount = (p.bookmarks || []).length;
  const noteCount = Object.keys(p.notes || {}).length;
  const completion = pct((s.completedLessons || []).length, 9);
  return `
    <div class="enterprise-stack">
      <div class="enterprise-kpis">
        <div class="enterprise-kpi"><div class="label">Name</div><div class="value">${a.name || 'Learner'}</div><div class="sub">Local profile</div></div>
        <div class="enterprise-kpi"><div class="label">Email</div><div class="value" style="font-size:16px">${a.email || '—'}</div><div class="sub">Signed in locally</div></div>
        <div class="enterprise-kpi"><div class="label">Bookmarks</div><div class="value">${bookmarkCount}</div><div class="sub">Saved questions</div></div>
        <div class="enterprise-kpi"><div class="label">Last score</div><div class="value">${last ? `${last.score}%` : '—'}</div><div class="sub">Most recent exam</div></div>
      </div>
      <div class="enterprise-grid">
        <div class="enterprise-card">
          <h3>Profile overview</h3>
          <div class="pillline">
            <span>Lessons ${s.completedLessons?.length || 0}</span>
            <span>Sessions ${sessions().length}</span>
            <span>Notes ${noteCount}</span>
            <span>Streak ${s.streak || 0}d</span>
          </div>
          <div class="ux-divider"></div>
          <p>Completion is currently ${completion}%. The local profile is tied to this device and can be paired with the command palette and premium tools.</p>
        </div>
        <div class="enterprise-card">
          <h3>Recent activity</h3>
          <div class="legend-box">
            <div class="legend-item"><div class="k">Premium mode</div><div class="v">${p.mode || 'overview'}</div></div>
            <div class="legend-item"><div class="k">UX theme</div><div class="v">${getUx().theme || 'dark'}</div></div>
          </div>
          <div class="ux-divider"></div>
          <p>${last ? `Latest session scored ${last.score}% with ${last.total} questions.` : 'No exam session has been recorded yet.'}</p>
        </div>
      </div>
    </div>
  `;
}

function pricingView() {
  return `
    <div class="enterprise-stack">
      <div class="enterprise-card">
        <h3>Pricing tiers</h3>
        <p>Simple model for a premium exam-prep product.</p>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card">
          <div class="badge">Free</div>
          <div class="price">$0 <small>/ month</small></div>
          <p>Practice access, limited sessions, and basic analytics.</p>
          <div class="pricing-list">
            <div>Practice questions</div>
            <div>Session history</div>
            <div>Basic dashboard</div>
          </div>
        </div>
        <div class="pricing-card featured">
          <div class="badge">Pro</div>
          <div class="price">$19 <small>/ month</small></div>
          <p>Full exam simulator, premium analytics, bookmarks, notes, and export tools.</p>
          <div class="pricing-list">
            <div>Unlimited mock exams</div>
            <div>Command palette</div>
            <div>Premium center</div>
            <div>Full analytics</div>
          </div>
        </div>
        <div class="pricing-card">
          <div class="badge">Team</div>
          <div class="price">$49 <small>/ month</small></div>
          <p>Shared study dashboards, cohort progress, and admin content controls.</p>
          <div class="pricing-list">
            <div>Multiple learners</div>
            <div>Admin analytics</div>
            <div>Content publishing</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function analyticsView() {
  const s = getState();
  const history = sessions();
  const trend = history.slice().reverse().map((x) => x.score);
  const people = history.length ? Math.round(history.reduce((sum, x) => sum + (x.domainScores?.People || 0), 0) / history.length) : 68;
  const process = history.length ? Math.round(history.reduce((sum, x) => sum + (x.domainScores?.Process || 0), 0) / history.length) : 64;
  const business = history.length ? Math.round(history.reduce((sum, x) => sum + (x.domainScores?.['Business Environment'] || 0), 0) / history.length) : 70;
  return `
    <div class="enterprise-stack">
      <div class="enterprise-card">
        <div class="enterprise-kpis">
          <div class="enterprise-kpi"><div class="label">Readiness</div><div class="value">${s.completedLessons?.length ? Math.min(100, Math.round((s.completedLessons.length / 9) * 100)) : 0}%</div><div class="sub">Learning completion</div></div>
          <div class="enterprise-kpi"><div class="label">Goal</div><div class="value">${s.goal || 80}%</div><div class="sub">Target score</div></div>
          <div class="enterprise-kpi"><div class="label">Sessions</div><div class="value">${history.length}</div><div class="sub">Stored runs</div></div>
          <div class="enterprise-kpi"><div class="label">Streak</div><div class="value">${s.streak || 0}d</div><div class="sub">Active days</div></div>
        </div>
      </div>
      <div class="enterprise-split">
        <div class="enterprise-card">
          <h3>Score trend</h3>
          <div class="mini-spark">${buildSpark(trend)}</div>
          <div class="pillline">
            <span>Latest ${latest() ? `${latest().score}%` : '—'}</span>
            <span>Highest ${history.length ? Math.max(...history.map((x) => x.score)) : '—'}</span>
            <span>Lowest ${history.length ? Math.min(...history.map((x) => x.score)) : '—'}</span>
          </div>
        </div>
        <div class="enterprise-card">
          <h3>Domain averages</h3>
          <div class="bar-list">
            <div class="bar-row"><div class="label">People</div><div class="bar-track"><div class="bar-fill" style="width:${people}%"></div></div><div class="score">${people}%</div></div>
            <div class="bar-row"><div class="label">Process</div><div class="bar-track"><div class="bar-fill" style="width:${process}%"></div></div><div class="score">${process}%</div></div>
            <div class="bar-row"><div class="label">Business Environment</div><div class="bar-track"><div class="bar-fill" style="width:${business}%"></div></div><div class="score">${business}%</div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function settingsView() {
  const ux = getUx();
  return `
    <div class="enterprise-grid">
      <div class="enterprise-card">
        <h3>UX preferences</h3>
        <p>Current theme: ${ux.theme || 'dark'}<br>Sidebar collapsed: ${ux.sidebarCollapsed ? 'yes' : 'no'}</p>
        <div class="pillline"><span>Ctrl+K command palette</span><span>Theme toggle</span><span>Toasts</span></div>
      </div>
      <div class="enterprise-card">
        <h3>Control actions</h3>
        <p>Use the footer buttons to switch theme, collapse the sidebar, or reset local UX data.</p>
      </div>
    </div>
  `;
}

function renderTabs() {
  return `
    <div class="enterprise-tabs">
      ${tabButtons()}
    </div>
  `;
}

function renderModal() {
  ensureModal();
  const tabs = document.querySelector('#enterprise-tabs');
  const content = document.querySelector('#enterprise-content');
  if (!tabs || !content) return;
  tabs.innerHTML = renderTabs();
  content.innerHTML = activeTab === 'profile' ? profileView() : activeTab === 'pricing' ? pricingView() : activeTab === 'analytics' ? analyticsView() : settingsView();
}

function injectSurface() {
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('[data-enterprise-strip]')) {
    const s = getState();
    const auth = getAuth();
    const last = latest();
    const strip = document.createElement('div');
    strip.setAttribute('data-enterprise-strip', 'true');
    strip.className = 'enterprise-card';
    strip.style.marginTop = '14px';
    strip.innerHTML = `
      <div class="premium-row" style="justify-content:space-between;align-items:center;">
        <div>
          <div class="enterprise-meta">Enterprise summary</div>
          <div style="font-size:18px;font-weight:800;margin-top:4px;">${auth.name || 'Learner'} • ${auth.email || 'Local session'}</div>
        </div>
        <button class="btn" data-enterprise-action="open">Open control center</button>
      </div>
      <div class="pillline">
        <span>Last score ${last ? `${last.score}%` : '—'}</span>
        <span>Lessons ${(s.completedLessons || []).length}</span>
        <span>Saved ${(s.savedQuestions || []).length}</span>
      </div>
    `;
    hero.insertBefore(strip, hero.children[2] || null);
  }
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-enterprise-action]')?.dataset.enterpriseAction;
    if (!action) return;
    if (action === 'open') openModal('profile');
    if (action === 'close') closeModal();
    if (action === 'profile') { activeTab = 'profile'; renderModal(); }
    if (action === 'pricing') { activeTab = 'pricing'; renderModal(); }
    if (action === 'analytics') { activeTab = 'analytics'; renderModal(); }
    if (action === 'theme') document.querySelector('[data-ux-action="toggle-theme"]')?.click();
    if (action === 'sidebar') document.querySelector('[data-ux-action="toggle-sidebar"]')?.click();
    if (action === 'reset') {
      if (confirm('Reset UX preferences only?')) {
        localStorage.removeItem(UX_KEY);
        document.querySelector('[data-ux-action="toggle-theme"]')?.click();
        document.querySelector('[data-ux-action="toggle-sidebar"]')?.click();
      }
    }
  });
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-enterprise-tab]')?.dataset.enterpriseTab;
    if (!tab) return;
    activeTab = tab;
    renderModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function boot() {
  ensureLauncher();
  ensureModal();
  injectSurface();
  bindEvents();
  setInterval(() => {
    ensureLauncher();
    injectSurface();
  }, 1600);
}

boot();
