const MAIN_KEYS = ['exam-hall-state-v4', 'exam-hall-state-v3', 'exam-hall-state-v2', 'exam-hall-state-v1'];

const style = document.createElement('style');
style.textContent = `
  .charts-panel {
    margin-top: 14px;
    padding: 16px;
    border: 1px solid #274053;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  }
  .charts-grid {
    display: grid;
    grid-template-columns: 1.25fr .75fr;
    gap: 12px;
    margin-top: 12px;
  }
  .chart-card {
    padding: 14px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .chart-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .chart-title h4 {
    margin: 0;
    font-size: 14px;
  }
  .chart-title span {
    color: #95a8bd;
    font-size: 11px;
  }
  .chart-list { display: grid; gap: 10px; }
  .chart-row {
    display: grid;
    grid-template-columns: 96px 1fr 54px;
    gap: 10px;
    align-items: center;
  }
  .chart-label { color: #95a8bd; font-size: 12px; }
  .chart-track {
    height: 12px;
    border-radius: 999px;
    background: #102131;
    overflow: hidden;
    border: 1px solid #24394d;
  }
  .chart-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #8dd2ff, #79ffa8);
  }
  .chart-badge { text-align: right; color: #d9e4ef; font-size: 12px; }
  .mini-spark {
    width: 100%;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid #233648;
    background: rgba(255,255,255,.03);
    padding: 10px;
  }
  .legend {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .legend span {
    padding: 6px 9px;
    border-radius: 999px;
    border: 1px solid #2e4a62;
    background: rgba(255,255,255,.04);
    color: #d9e4ef;
    font-size: 11px;
  }
`;
document.head.appendChild(style);

function loadState() {
  for (const key of MAIN_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return {};
}

function sessions() {
  const state = loadState();
  return Array.isArray(state.examHistory) ? state.examHistory : [];
}

function buildSpark(values, width = 560, height = 150) {
  if (!values.length) return `<div class="chart-label">No data yet.</div>`;
  const safe = values.map((v) => Math.max(0, Math.min(100, Number(v) || 0)));
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = safe.map((v, i) => [i * step, height - ((v / 100) * (height - 20)) - 10]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8dd2ff" />
          <stop offset="100%" stop-color="#79ffa8" />
        </linearGradient>
      </defs>
      <path d="${d}" fill="none" stroke="url(#scoreGradient)" stroke-width="3" />
      ${points.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#8dd2ff" opacity="${i === points.length - 1 ? 1 : 0.8}" />`).join('')}
    </svg>
  `;
}

function renderCharts() {
  const current = document.querySelector('#tabArea');
  const tabLabel = document.querySelector('.navbtn.active strong')?.textContent || '';
  if (!current || (tabLabel !== 'Dashboard' && tabLabel !== 'Session History')) return;
  if (current.querySelector('[data-analytics-injected]')) return;

  const state = loadState();
  const history = sessions();
  const last = history[0] || null;
  const trend = history.slice().reverse().map((s) => s.score);
  const averages = {
    People: history.length ? Math.round(history.reduce((sum, s) => sum + (s.domainScores?.People || 0), 0) / history.length) : 68,
    Process: history.length ? Math.round(history.reduce((sum, s) => sum + (s.domainScores?.Process || 0), 0) / history.length) : 64,
    'Business Environment': history.length ? Math.round(history.reduce((sum, s) => sum + (s.domainScores?.['Business Environment'] || 0), 0) / history.length) : 70,
  };

  const wrap = document.createElement('div');
  wrap.setAttribute('data-analytics-injected', 'true');
  wrap.className = 'charts-panel';
  wrap.innerHTML = `
    <div class="chart-title">
      <div>
        <h4>Performance charts</h4>
        <span>Trend, domain split, and current readiness</span>
      </div>
      <span>${history.length} session(s)</span>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-title">
          <h4>Score trend</h4>
          <span>${last ? `Latest ${last.score}%` : 'No sessions yet'}</span>
        </div>
        <div class="mini-spark">${buildSpark(trend)}</div>
        <div class="legend">
          <span>Readiness ${Math.max(0, Math.min(100, Math.round((state.completedLessons?.length || 0) * 11 + (last ? last.score / 2 : 0))))}%</span>
          <span>Goal ${state.goal || 80}%</span>
          <span>Streak ${state.streak || 0}d</span>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-title">
          <h4>Domain split</h4>
          <span>Average across sessions</span>
        </div>
        <div class="chart-list">
          ${Object.entries(averages).map(([label, score]) => `
            <div class="chart-row">
              <div class="chart-label">${label}</div>
              <div class="chart-track"><div class="chart-fill" style="width:${score}%"></div></div>
              <div class="chart-badge">${score}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  current.appendChild(wrap);
}

function ensureStickyAnalytics() {
  if (document.querySelector('#analytics-summary')) return;
  const focus = document.querySelector('#focusArea');
  if (!focus) return;
  const state = loadState();
  const history = sessions();
  const last = history[0] || null;
  const box = document.createElement('div');
  box.id = 'analytics-summary';
  box.className = 'item';
  box.innerHTML = `
    <div class="itemtop">
      <div>
        <b>Analytics snapshot</b>
        <div class="meta">Compact progress summary</div>
      </div>
      <div class="badge">${last ? `${last.score}%` : '—'}</div>
    </div>
    <div class="legend">
      <span>Lessons ${state.completedLessons?.length || 0}</span>
      <span>Saved ${state.savedQuestions?.length || 0}</span>
      <span>Sessions ${history.length}</span>
    </div>
  `;
  focus.appendChild(box);
}

function syncAnalytics() {
  renderCharts();
  ensureStickyAnalytics();
}

setInterval(syncAnalytics, 1500);
syncAnalytics();
