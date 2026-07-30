const KEYS = ['exam-hall-state-v4', 'exam-hall-state-v3', 'exam-hall-state-v2', 'exam-hall-state-v1'];
const style = document.createElement('style');
style.textContent = `
  .insights-launcher {
    position: fixed;
    left: 18px;
    bottom: 150px;
    z-index: 96;
    border: 1px solid #35546d;
    background: linear-gradient(145deg, rgba(141,210,255,.18), rgba(121,255,168,.16));
    color: #eef4fb;
    border-radius: 999px;
    padding: 12px 16px;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    backdrop-filter: blur(12px);
    font-weight: 800;
  }
  .insights-modal {
    position: fixed;
    inset: 0;
    z-index: 250;
    display: none;
    background: rgba(0,0,0,.68);
    backdrop-filter: blur(16px);
  }
  .insights-modal.open { display: grid; place-items: center; }
  .insights-shell {
    width: min(1360px, calc(100vw - 18px));
    height: min(94vh, 980px);
    border: 1px solid #35546d;
    border-radius: 30px;
    overflow: hidden;
    background: linear-gradient(180deg, #0b1826, #08111b);
    box-shadow: 0 30px 120px rgba(0,0,0,.6);
    display: grid;
    grid-template-rows: auto auto 1fr auto;
  }
  .insights-top {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:12px;
    padding: 16px 18px;
    border-bottom: 1px solid #203346;
    background: rgba(10,18,28,.94);
  }
  .insights-top h2 { margin: 0; font-size: 18px; }
  .insights-top p { margin: 4px 0 0; color: #95a8bd; font-size: 12px; }
  .insights-tabs {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    padding: 12px 18px;
    border-bottom: 1px solid #203346;
    background: rgba(255,255,255,.02);
  }
  .insights-tab {
    padding: 9px 12px;
    border-radius: 999px;
    border: 1px solid #2f516b;
    background: rgba(255,255,255,.03);
    color: #d9e4ef;
    font-size: 12px;
  }
  .insights-tab.active { background: rgba(141,210,255,.15); }
  .insights-content { padding: 16px 18px 18px; overflow:auto; }
  .insights-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .insights-card {
    padding: 16px;
    border: 1px solid #233648;
    border-radius: 20px;
    background: rgba(255,255,255,.03);
  }
  .insights-card h3 { margin: 0 0 10px; font-size: 16px; }
  .insights-card h4 { margin: 0 0 8px; font-size: 14px; }
  .insights-card p, .insights-meta { margin: 0; color: #c8d4e0; font-size: 13px; line-height: 1.5; }
  .insights-kpis { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:10px; }
  .insights-kpi {
    padding: 14px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .insights-kpi .label { color: #95a8bd; font-size: 11px; }
  .insights-kpi .value { margin-top: 8px; font-size: 26px; font-weight: 800; letter-spacing: -.04em; }
  .insights-kpi .sub { margin-top: 4px; color: #c8d4e0; font-size: 12px; }
  .insights-bars { display:grid; gap:10px; }
  .insights-row { display:grid; grid-template-columns: 120px 1fr 58px; gap:10px; align-items:center; }
  .insights-track { height: 12px; border-radius: 999px; background: #102131; overflow:hidden; border:1px solid #24394d; }
  .insights-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #8dd2ff, #79ffa8); }
  .insights-score { text-align:right; color:#d9e4ef; font-size:12px; }
  .insights-legend { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
  .insights-legend span { padding: 6px 10px; border-radius: 999px; border: 1px solid #2e4a62; background: rgba(255,255,255,.04); color:#d9e4ef; font-size:11px; }
  .heatmap {
    display:grid;
    grid-template-columns: repeat(7, minmax(0,1fr));
    gap: 8px;
  }
  .heat-cell {
    min-height: 58px;
    padding: 10px;
    border-radius: 14px;
    border: 1px solid #233648;
    background: rgba(255,255,255,.03);
    display:flex;
    flex-direction:column;
    justify-content:space-between;
  }
  .heat-cell strong { font-size: 14px; }
  .heat-cell span { color: #95a8bd; font-size: 11px; }
  .heat-cell.active { background: rgba(121,255,168,.14); border-color: #2f7d5a; }
  .heat-cell.medium { background: rgba(255,212,121,.12); border-color: #7d6730; }
  .heat-cell.strong { background: rgba(141,210,255,.14); border-color: #3f6784; }
  .insights-footer { padding: 14px 18px 18px; border-top: 1px solid #203346; display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }
  .mini-spark { width:100%; overflow:hidden; border:1px solid #233648; border-radius:18px; background:rgba(255,255,255,.03); padding: 10px; }
  .radar-wrap { width: 100%; overflow: hidden; border:1px solid #233648; border-radius:18px; background: rgba(255,255,255,.03); padding: 12px; }
  @media (max-width: 1100px) {
    .insights-grid, .insights-kpis { grid-template-columns: 1fr; }
    .insights-row { grid-template-columns: 1fr; }
    .insights-score { text-align:left; }
  }
`;
document.head.appendChild(style);

function loadState() {
  for (const key of KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
  }
  return {};
}

function sessions() {
  const state = loadState();
  return Array.isArray(state.examHistory) ? state.examHistory : [];
}

function latest() { return sessions()[0] || null; }
function pct(part, total) { return total ? Math.round((part / total) * 100) : 0; }
function average(domain) {
  const list = sessions().map((s) => s.domainScores?.[domain]).filter((n) => Number.isFinite(n));
  if (!list.length) return domain === 'People' ? 68 : domain === 'Process' ? 64 : 70;
  return Math.round(list.reduce((a, b) => a + b, 0) / list.length);
}
function buildSpark(values, width = 560, height = 150) {
  if (!values.length) return `<div class="insights-meta">No data yet.</div>`;
  const safe = values.map((v) => Math.max(0, Math.min(100, Number(v) || 0)));
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = safe.map((v, i) => [i * step, height - ((v / 100) * (height - 20)) - 10]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none"><defs><linearGradient id="insightsGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8dd2ff"/><stop offset="100%" stop-color="#79ffa8"/></linearGradient></defs><path d="${d}" fill="none" stroke="url(#insightsGradient)" stroke-width="3"/></svg>`;
}
function buildRadar(values) {
  const w = 320, h = 320, cx = 160, cy = 160, r = 120;
  const points = values.map((v, i) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * i / values.length);
    const rad = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad];
  });
  const grid = [25, 50, 75, 100].map((level) => {
    const pts = values.map((_, i) => {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * i / values.length);
      const rad = (level / 100) * r;
      return `${cx + Math.cos(angle) * rad},${cy + Math.sin(angle) * rad}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#2a4156" stroke-width="1" opacity="0.8" />`;
  }).join('');
  const spokes = values.map((_, i) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * i / values.length);
    return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(angle) * r}" y2="${cy + Math.sin(angle) * r}" stroke="#2a4156" stroke-width="1" opacity="0.8" />`;
  }).join('');
  const poly = points.map((p) => `${p[0]},${p[1]}`).join(' ');
  const labels = ['People', 'Process', 'Business Environment'].map((label, i) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * i / values.length);
    const lx = cx + Math.cos(angle) * (r + 22);
    const ly = cy + Math.sin(angle) * (r + 22);
    return `<text x="${lx}" y="${ly}" fill="#d9e4ef" font-size="12" text-anchor="middle">${label}</text>`;
  }).join('');
  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMidYMid meet">
      ${grid}
      ${spokes}
      <polygon points="${poly}" fill="rgba(141,210,255,.20)" stroke="#8dd2ff" stroke-width="2" />
      ${labels}
    </svg>
  `;
}

function ensureLauncher() {
  if (document.querySelector('#insights-launcher')) return;
  const btn = document.createElement('button');
  btn.id = 'insights-launcher';
  btn.className = 'insights-launcher';
  btn.textContent = 'Advanced Analytics';
  btn.addEventListener('click', () => openModal('overview'));
  document.body.appendChild(btn);
}

function ensureModal() {
  if (document.querySelector('#insights-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'insights-modal';
  modal.className = 'insights-modal';
  modal.innerHTML = `
    <div class="insights-shell" role="dialog" aria-modal="true" aria-labelledby="insights-title">
      <div class="insights-top">
        <div>
          <h2 id="insights-title">Advanced Analytics Console</h2>
          <p>Trend, radar, heatmap, and recommendation engine.</p>
        </div>
        <div class="premium-row">
          <button class="btn ghost" data-insights-action="overview">Overview</button>
          <button class="btn ghost" data-insights-action="radar">Radar</button>
          <button class="btn ghost" data-insights-action="heatmap">Heatmap</button>
          <button class="btn danger" data-insights-action="close">Close</button>
        </div>
      </div>
      <div class="insights-tabs" id="insights-tabs"></div>
      <div class="insights-content" id="insights-content"></div>
      <div class="insights-footer">
        <button class="btn ghost" data-insights-action="jump-dashboard">Dashboard</button>
        <button class="btn ghost" data-insights-action="jump-sessions">Sessions</button>
        <button class="btn ghost" data-insights-action="jump-practice">Practice</button>
      </div>
    </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);
}

let mode = 'overview';

function openModal(next = 'overview') {
  mode = next;
  ensureModal();
  render();
  document.querySelector('#insights-modal')?.classList.add('open');
}
function closeModal() { document.querySelector('#insights-modal')?.classList.remove('open'); }

function tabs() {
  const opts = [['overview', 'Overview'], ['radar', 'Radar'], ['heatmap', 'Heatmap'], ['recommendations', 'Recommendations']];
  return opts.map(([id, label]) => `<button class="insights-tab ${mode === id ? 'active' : ''}" data-insights-tab="${id}">${label}</button>`).join('');
}

function overviewView() {
  const state = loadState();
  const history = sessions();
  const scoreTrend = history.slice().reverse().map((s) => s.score);
  const last = latest();
  const p = average('People');
  const pr = average('Process');
  const b = average('Business Environment');
  return `
    <div class="insights-kpis">
      <div class="insights-kpi"><div class="label">Readiness</div><div class="value">${Math.min(100, Math.round((state.completedLessons?.length || 0) * 11 + (last ? last.score / 2 : 0))) || 0}%</div><div class="sub">Composite learning readiness</div></div>
      <div class="insights-kpi"><div class="label">Sessions</div><div class="value">${history.length}</div><div class="sub">Stored mock exams</div></div>
      <div class="insights-kpi"><div class="label">Goal</div><div class="value">${state.goal || 80}%</div><div class="sub">Current target score</div></div>
      <div class="insights-kpi"><div class="label">Streak</div><div class="value">${state.streak || 0}d</div><div class="sub">Consecutive active days</div></div>
    </div>
    <div class="insights-grid" style="margin-top:12px;">
      <div class="insights-card">
        <h3>Score trend</h3>
        <div class="mini-spark">${buildSpark(scoreTrend)}</div>
        <div class="insights-legend">
          <span>Latest ${last ? `${last.score}%` : '—'}</span>
          <span>Highest ${history.length ? Math.max(...history.map((x) => x.score)) : '—'}</span>
          <span>Lowest ${history.length ? Math.min(...history.map((x) => x.score)) : '—'}</span>
        </div>
      </div>
      <div class="insights-card">
        <h3>Domain distribution</h3>
        <div class="insights-bars">
          <div class="insights-row"><div class="label">People</div><div class="insights-track"><div class="insights-fill" style="width:${p}%"></div></div><div class="insights-score">${p}%</div></div>
          <div class="insights-row"><div class="label">Process</div><div class="insights-track"><div class="insights-fill" style="width:${pr}%"></div></div><div class="insights-score">${pr}%</div></div>
          <div class="insights-row"><div class="label">Business Environment</div><div class="insights-track"><div class="insights-fill" style="width:${b}%"></div></div><div class="insights-score">${b}%</div></div>
        </div>
      </div>
    </div>
  `;
}

function radarView() {
  const values = [average('People'), average('Process'), average('Business Environment')];
  return `
    <div class="insights-grid">
      <div class="insights-card">
        <h3>Radar chart</h3>
        <div class="radar-wrap">${buildRadar(values)}</div>
      </div>
      <div class="insights-card">
        <h3>Interpretation</h3>
        <p>The strongest domain is the one with the highest average. The weakest domain should be the first target for the next study block.</p>
        <div class="ux-divider"></div>
        <p>Use the radar chart to compare domain balance instead of relying only on a single score.</p>
      </div>
    </div>
  `;
}

function heatmapView() {
  const days = [];
  const sessionsByDay = new Map();
  sessions().forEach((s) => {
    const key = new Date(s.date).toISOString().slice(0, 10);
    sessionsByDay.set(key, (sessionsByDay.get(key) || 0) + 1);
  });
  for (let i = 20; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = sessionsByDay.get(key) || 0;
    days.push({ label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count });
  }
  return `
    <div class="insights-grid">
      <div class="insights-card">
        <h3>Activity heatmap</h3>
        <div class="heatmap">
          ${days.map((d) => {
            const cls = d.count >= 3 ? 'strong' : d.count >= 1 ? 'active' : 'medium';
            return `<div class="heat-cell ${d.count === 0 ? '' : cls}"><strong>${d.count}</strong><span>${d.label}</span></div>`;
          }).join('')}
        </div>
      </div>
      <div class="insights-card">
        <h3>Study cadence</h3>
        <p>Frequency matters more than bursts. The heatmap shows which days have repeated exam attempts and which days are inactive.</p>
      </div>
    </div>
  `;
}

function recommendationsView() {
  const sorted = ['People', 'Process', 'Business Environment'].sort((a, b) => average(a) - average(b));
  const state = loadState();
  const last = latest();
  const weak = sorted[0];
  const nextScore = Math.min(100, Math.max(0, Math.round(((state.completedLessons?.length || 0) / 9) * 100 + ((last ? last.score : 0) / 2))));
  return `
    <div class="insights-grid">
      <div class="insights-card">
        <h3>Priority queue</h3>
        <div class="insights-legend">
          <span>1. ${sorted[0]}</span>
          <span>2. ${sorted[1]}</span>
          <span>3. ${sorted[2]}</span>
        </div>
        <div class="ux-divider"></div>
        <p>Target ${weak.toLowerCase()} first. Repeat the mock exam after a short focused drill.</p>
      </div>
      <div class="insights-card">
        <h3>Forecast</h3>
        <p>Current projected readiness: <strong>${nextScore}%</strong>.</p>
        <div class="ux-divider"></div>
        <p>Projected improvement depends on the next three sessions and whether the weakest domain is improved.</p>
      </div>
    </div>
  `;
}

function render() {
  ensureModal();
  const tabsHost = document.querySelector('#insights-tabs');
  const content = document.querySelector('#insights-content');
  if (!tabsHost || !content) return;
  tabsHost.innerHTML = tabs();
  if (mode === 'overview') content.innerHTML = overviewView();
  else if (mode === 'radar') content.innerHTML = radarView();
  else if (mode === 'heatmap') content.innerHTML = heatmapView();
  else content.innerHTML = recommendationsView();
}

function injectLaunchers() {
  if (!document.querySelector('#insights-launcher')) {
    const btn = document.createElement('button');
    btn.id = 'insights-launcher';
    btn.className = 'insights-launcher';
    btn.textContent = 'Advanced Analytics';
    btn.addEventListener('click', () => openModal('overview'));
    document.body.appendChild(btn);
  }
  const panel = document.querySelector('#tabArea');
  if (panel && panel.textContent.includes('Dashboard') && !panel.querySelector('[data-insights-dashboard-card]')) {
    const card = document.createElement('div');
    card.setAttribute('data-insights-dashboard-card', 'true');
    card.className = 'foundation-band';
    card.innerHTML = `
      <h4>Analytics center</h4>
      <div class="foundation-grid">
        <div class="foundation-card"><div class="k">Trend</div><div class="v">${latest() ? `${latest().score}%` : '—'}</div><div class="s">Latest stored exam score.</div></div>
        <div class="foundation-card"><div class="k">Weak domain</div><div class="v">${['People','Process','Business Environment'].sort((a, b) => average(a) - average(b))[0]}</div><div class="s">Primary area for the next study block.</div></div>
        <div class="foundation-card"><div class="k">Forecast</div><div class="v">${Math.min(100, Math.round(((loadState().completedLessons?.length || 0) / 9) * 100 + ((latest() ? latest().score : 0) / 2))) || 0}%</div><div class="s">Readiness forecast from current progress.</div></div>
      </div>
      <div class="premium-row" style="margin-top:12px;">
        <button class="btn" data-insights-action="open">Open analytics console</button>
      </div>
    `;
    panel.insertBefore(card, panel.children[2] || null);
  }
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-insights-action]')?.dataset.insightsAction;
    if (!action) return;
    if (action === 'open') openModal('overview');
    if (action === 'close') closeModal();
    if (action === 'overview') { mode = 'overview'; render(); }
    if (action === 'radar') { mode = 'radar'; render(); }
    if (action === 'heatmap') { mode = 'heatmap'; render(); }
    if (action === 'jump-dashboard') document.querySelector('[data-tab="dashboard"]')?.click();
    if (action === 'jump-sessions') openModal('heatmap');
    if (action === 'jump-practice') document.querySelector('[data-tab="practice"]')?.click();
  });
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-insights-tab]')?.dataset.insightsTab;
    if (!tab) return;
    mode = tab;
    render();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function boot() {
  ensureLauncher();
  ensureModal();
  injectLaunchers();
  bindEvents();
  setInterval(() => {
    ensureLauncher();
    injectLaunchers();
  }, 1800);
}

boot();
