import { domains, lessons, practiceQuestions } from './data.js';

const MAIN_KEYS = ['exam-hall-state-v4', 'exam-hall-state-v3', 'exam-hall-state-v2', 'exam-hall-state-v1'];
const EXTRA_KEY = 'exam-hall-premium-v1';

const styles = document.createElement('style');
styles.textContent = `
  .premium-launcher {
    position: fixed;
    right: 18px;
    bottom: 92px;
    z-index: 80;
    border: 1px solid #35546d;
    background: linear-gradient(145deg, rgba(141,210,255,.22), rgba(121,255,168,.14));
    color: #eef4fb;
    border-radius: 999px;
    padding: 12px 16px;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    backdrop-filter: blur(12px);
    font-weight: 800;
    letter-spacing: .01em;
  }
  .premium-badge-line {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .premium-chip {
    padding: 7px 10px;
    border: 1px solid #2e4a62;
    border-radius: 999px;
    background: rgba(255,255,255,.04);
    color: #d9e4ef;
    font-size: 11px;
  }
  .premium-panel {
    margin-top: 14px;
    padding: 16px;
    border: 1px solid #274053;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  }
  .premium-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .premium-row > * { flex: 0 0 auto; }
  .premium-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .premium-mini {
    padding: 12px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .premium-mini .label { color: #95a8bd; font-size: 11px; }
  .premium-mini .value { margin-top: 6px; font-size: 24px; font-weight: 800; letter-spacing: -.04em; }
  .premium-mini .sub { margin-top: 4px; color: #c8d4e0; font-size: 12px; }
  .premium-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: none;
    background: rgba(0,0,0,.62);
    backdrop-filter: blur(14px);
  }
  .premium-modal.open { display: grid; place-items: center; }
  .premium-shell {
    width: min(1120px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    border: 1px solid #35546d;
    border-radius: 28px;
    background: linear-gradient(180deg, #0b1826, #08111b);
    box-shadow: 0 30px 120px rgba(0,0,0,.5);
  }
  .premium-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid #203346;
    position: sticky;
    top: 0;
    background: rgba(10,18,28,.9);
    backdrop-filter: blur(16px);
    z-index: 1;
  }
  .premium-top h2 { margin: 0; font-size: 18px; }
  .premium-tabs { display: flex; gap: 8px; flex-wrap: wrap; padding: 14px 20px 0; }
  .premium-tab {
    padding: 9px 12px;
    border-radius: 999px;
    border: 1px solid #2f516b;
    background: rgba(255,255,255,.03);
    color: #d9e4ef;
    font-size: 12px;
  }
  .premium-tab.active { background: rgba(141,210,255,.15); }
  .premium-content { padding: 18px 20px 20px; }
  .premium-section { margin-bottom: 16px; }
  .premium-section h3 { margin: 0 0 10px; font-size: 16px; }
  .premium-search {
    width: 100%;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid #274053;
    background: #0c1723;
    color: #eef4fb;
    outline: none;
  }
  .premium-list { display: grid; gap: 10px; }
  .premium-item {
    padding: 14px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .premium-item-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
  .premium-meta { font-size: 12px; color: #95a8bd; }
  .premium-note {
    width: 100%;
    min-height: 82px;
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid #274053;
    background: #0c1723;
    color: #eef4fb;
    resize: vertical;
  }
  .premium-spark {
    width: 100%;
    overflow: hidden;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
    padding: 12px;
  }
  .premium-footer {
    padding: 14px 20px 20px;
    border-top: 1px solid #203346;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .premium-divider { height: 1px; background: #203346; margin: 14px 0; }
`;
document.head.appendChild(styles);

function loadMainState() {
  for (const key of MAIN_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { key, state: JSON.parse(raw) };
    } catch {
      // ignore
    }
  }
  return { key: MAIN_KEYS[0], state: {} };
}

function loadExtra() {
  try {
    const raw = localStorage.getItem(EXTRA_KEY);
    return raw ? JSON.parse(raw) : { bookmarks: [], notes: {}, mode: 'overview' };
  } catch {
    return { bookmarks: [], notes: {}, mode: 'overview' };
  }
}

function saveExtra(next) {
  localStorage.setItem(EXTRA_KEY, JSON.stringify(next));
}

let { key: mainKey, state: mainState } = loadMainState();
let extra = loadExtra();

function refreshMainState() {
  const loaded = loadMainState();
  mainKey = loaded.key;
  mainState = loaded.state || {};
}

function storeMainState(nextState) {
  localStorage.setItem(mainKey, JSON.stringify(nextState));
  refreshMainState();
}

function pct(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function latestSession() {
  return Array.isArray(mainState.examHistory) ? mainState.examHistory[0] ?? null : null;
}

function allSessions() {
  return Array.isArray(mainState.examHistory) ? mainState.examHistory : [];
}

function readinessScore() {
  const lessonsDone = Array.isArray(mainState.completedLessons) ? mainState.completedLessons.length : 0;
  const saved = Array.isArray(mainState.savedQuestions) ? mainState.savedQuestions.length : 0;
  const last = latestSession();
  const score = last ? last.score : 0;
  return Math.min(100, Math.max(0, Math.round((pct(lessonsDone, lessons.length) * 0.3) + (pct(saved, practiceQuestions.length) * 0.2) + (score * 0.5))));
}

function avgDomainScore(domain) {
  const sessions = allSessions();
  const values = sessions.map((s) => s.domainScores?.[domain]).filter((n) => Number.isFinite(n));
  if (!values.length) return domain === 'People' ? 68 : domain === 'Process' ? 64 : 70;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function weakDomain() {
  return [...domains].map((domain) => ({ domain, score: avgDomainScore(domain) })).sort((a, b) => a.score - b.score)[0];
}

function sparkline(values, width = 520, height = 140) {
  if (!values.length) {
    return `<div class="premium-meta">No sessions yet.</div>`;
  }
  const safe = values.map((v) => Math.max(0, Math.min(100, Number(v) || 0)));
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = safe.map((v, i) => [i * step, height - ((v / 100) * (height - 20)) - 10]);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const circles = points.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#8dd2ff" opacity="${i === points.length - 1 ? 1 : 0.75}" />`).join('');
  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" aria-label="Performance sparkline">
      <defs>
        <linearGradient id="premiumLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8dd2ff" />
          <stop offset="100%" stop-color="#79ffa8" />
        </linearGradient>
      </defs>
      <path d="${d}" fill="none" stroke="url(#premiumLine)" stroke-width="3" />
      ${circles}
    </svg>
  `;
}

function pushAppTab(tab) {
  const button = document.querySelector(`[data-tab="${tab}"]`);
  if (button) button.click();
}

function ensureLauncher() {
  if (document.querySelector('#premium-launcher')) return;
  const launcher = document.createElement('button');
  launcher.id = 'premium-launcher';
  launcher.className = 'premium-launcher';
  launcher.textContent = 'Premium Center';
  launcher.addEventListener('click', () => openModal(extra.mode || 'overview'));
  document.body.appendChild(launcher);
}

function ensureModal() {
  if (document.querySelector('#premium-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'premium-modal';
  modal.className = 'premium-modal';
  modal.innerHTML = `
    <div class="premium-shell" role="dialog" aria-modal="true" aria-labelledby="premium-title">
      <div class="premium-top">
        <div>
          <div class="premium-meta">Ultra Premium Layer</div>
          <h2 id="premium-title">Premium Center</h2>
        </div>
        <div class="premium-row">
          <button class="btn ghost" data-premium-action="quick-drill">Quick Drill</button>
          <button class="btn ghost" data-premium-action="open-sessions">Sessions</button>
          <button class="btn danger" data-premium-action="close-modal">Close</button>
        </div>
      </div>
      <div class="premium-tabs" id="premium-tabs"></div>
      <div class="premium-content" id="premium-content"></div>
      <div class="premium-footer">
        <button class="btn ghost" data-premium-action="export">Export JSON</button>
        <button class="btn ghost" data-premium-action="import">Import JSON</button>
        <button class="btn warn" data-premium-action="reset-extra">Reset Premium Data</button>
      </div>
      <input type="file" id="premium-file" accept="application/json" hidden />
    </div>
  `;
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.body.appendChild(modal);
}

function openModal(tab = 'overview') {
  extra.mode = tab;
  saveExtra(extra);
  renderModal();
  document.querySelector('#premium-modal')?.classList.add('open');
}

function closeModal() {
  document.querySelector('#premium-modal')?.classList.remove('open');
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    main: mainState,
    premium: extra,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exam-hall-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (payload?.main) storeMainState(payload.main);
  if (payload?.premium) {
    extra = {
      bookmarks: Array.isArray(payload.premium.bookmarks) ? payload.premium.bookmarks : [],
      notes: payload.premium.notes && typeof payload.premium.notes === 'object' ? payload.premium.notes : {},
      mode: payload.premium.mode || 'overview',
    };
    saveExtra(extra);
  }
  renderAll();
}

function toggleBookmark(id) {
  const bookmarks = new Set(extra.bookmarks || []);
  if (bookmarks.has(id)) bookmarks.delete(id);
  else bookmarks.add(id);
  extra.bookmarks = [...bookmarks];
  saveExtra(extra);
  renderModal();
}

function saveNote(id, value) {
  extra.notes = extra.notes || {};
  extra.notes[id] = value;
  saveExtra(extra);
}

function renderTabs() {
  const tabs = [
    ['overview', 'Overview'],
    ['bank', 'Question Bank'],
    ['insights', 'Insights'],
    ['export', 'Export / Import'],
  ];
  const active = extra.mode || 'overview';
  return tabs.map(([id, label]) => `<button class="premium-tab ${active === id ? 'active' : ''}" data-premium-tab="${id}">${label}</button>`).join('');
}

function renderOverview() {
  const last = latestSession();
  const completion = pct(Array.isArray(mainState.completedLessons) ? mainState.completedLessons.length : 0, lessons.length);
  const sessions = allSessions();
  const activityDays = new Set(sessions.map((s) => new Date(s.date).toISOString().slice(0, 10)));
  const last14 = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last14.push({ key, active: activityDays.has(key), label: d.toLocaleDateString(undefined, { weekday: 'short' }) });
  }
  const weak = weakDomain();
  const nextLesson = lessons.find((lesson) => !(mainState.completedLessons || []).includes(lesson.id)) || lessons[0];
  return `
    <div class="premium-section">
      <h3>Readiness at a glance</h3>
      <div class="premium-grid">
        <div class="premium-mini"><div class="label">Readiness</div><div class="value">${readinessScore()}%</div><div class="sub">Composite study signal</div></div>
        <div class="premium-mini"><div class="label">Completion</div><div class="value">${completion}%</div><div class="sub">Lessons finished</div></div>
        <div class="premium-mini"><div class="label">Sessions</div><div class="value">${sessions.length}</div><div class="sub">Mock exam runs</div></div>
        <div class="premium-mini"><div class="label">Last score</div><div class="value">${last ? `${last.score}%` : '—'}</div><div class="sub">Most recent result</div></div>
      </div>
      <div class="premium-panel">
        <div class="premium-row" style="justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="premium-meta">Next lesson</div>
            <div style="font-size:18px;font-weight:800;margin-top:4px;">${nextLesson.title}</div>
            <div class="premium-meta" style="margin-top:4px;">${nextLesson.domain} • ${nextLesson.minutes} min</div>
          </div>
          <div class="badge">${weak.domain}</div>
        </div>
        <div class="premium-badge-line">
          <span class="premium-chip">${mainState.streak || 0} day streak</span>
          <span class="premium-chip">${Array.isArray(mainState.savedQuestions) ? mainState.savedQuestions.length : 0} saved</span>
          <span class="premium-chip">Goal ${mainState.goal || 80}%</span>
          <span class="premium-chip">${sessions.length ? 'Active history' : 'No sessions yet'}</span>
        </div>
        <p style="margin:12px 0 0;color:#c8d4e0;line-height:1.5;">${nextLesson.detail}</p>
        <div class="premium-row" style="margin-top:12px;">
          <button class="btn" data-premium-action="open-practice">Open Practice</button>
          <button class="btn ghost" data-premium-action="open-exam">Start Exam</button>
          <button class="btn ghost" data-premium-action="open-sessions">View Sessions</button>
        </div>
      </div>
    </div>
    <div class="premium-section">
      <h3>14-day activity calendar</h3>
      <div class="premium-panel">
        <div class="premium-row" style="justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div class="premium-meta">Green dots indicate active study days.</div>
          <div class="premium-meta">Weak domain: ${weak.domain}</div>
        </div>
        <div class="premium-row" style="gap: 6px; flex-wrap: nowrap; overflow: auto; padding-bottom: 4px;">
          ${last14.map((day) => `<div style="min-width: 56px; text-align:center; padding:10px 8px; border-radius:16px; border:1px solid #233648; background:${day.active ? 'rgba(121,255,168,.13)' : 'rgba(255,255,255,.03)'};">
            <div class="premium-meta">${day.label}</div>
            <div style="width:14px;height:14px;border-radius:50%;margin:8px auto 0;background:${day.active ? '#79ffa8' : '#314154'}"></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderBank() {
  const query = (extra.query || '').toLowerCase();
  const domain = extra.domain || 'All';
  const difficulty = extra.difficulty || 'All';
  const onlyBookmarks = !!extra.onlyBookmarks;
  const filtered = practiceQuestions.filter((q) => {
    const matchesQuery = !query || [q.stem, q.domain, q.difficulty, q.options.join(' ')].join(' ').toLowerCase().includes(query);
    const matchesDomain = domain === 'All' || q.domain === domain;
    const matchesDifficulty = difficulty === 'All' || q.difficulty === difficulty;
    const matchesBookmark = !onlyBookmarks || (extra.bookmarks || []).includes(q.id);
    return matchesQuery && matchesDomain && matchesDifficulty && matchesBookmark;
  });
  const domainsOptions = ['All', ...domains].map((item) => `<button class="premium-chip ${domain === item ? 'active' : ''}" data-premium-domain="${item}">${item}</button>`).join('');
  const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard'].map((item) => `<button class="premium-chip ${difficulty === item ? 'active' : ''}" data-premium-difficulty="${item}">${item}</button>`).join('');
  return `
    <div class="premium-section">
      <h3>Question bank browser</h3>
      <input class="premium-search" id="premium-search" placeholder="Search questions, domain, difficulty, or keywords" value="${extra.query || ''}" />
      <div class="premium-badge-line" style="margin-top:10px;">${domainsOptions}</div>
      <div class="premium-badge-line">${difficultyOptions}</div>
      <div class="premium-row" style="margin-top:10px;">
        <button class="btn ${onlyBookmarks ? '' : 'ghost'}" data-premium-action="toggle-bookmarks">${onlyBookmarks ? 'Showing bookmarks' : 'Show bookmarks only'}</button>
        <div class="premium-meta">${filtered.length} questions found</div>
      </div>
    </div>
    <div class="premium-list">
      ${filtered.map((q) => {
        const bookmarked = (extra.bookmarks || []).includes(q.id);
        return `
          <div class="premium-item">
            <div class="premium-item-top">
              <div>
                <div class="premium-meta">Question ${q.id} • ${q.domain} • ${q.difficulty}</div>
                <div style="font-size:16px;font-weight:800;margin-top:6px;">${q.stem}</div>
              </div>
              <button class="btn ${bookmarked ? '' : 'ghost'}" data-premium-bookmark="${q.id}">${bookmarked ? 'Bookmarked' : 'Bookmark'}</button>
            </div>
            <div class="premium-badge-line">
              ${q.options.map((o, i) => `<span class="premium-chip">${String.fromCharCode(65 + i)}. ${o}</span>`).join('')}
            </div>
            <div class="premium-meta" style="margin-top:10px;">Answer: ${String.fromCharCode(65 + q.answer)}</div>
            <div class="premium-meta" style="margin-top:4px;">${q.rationale}</div>
            <textarea class="premium-note" data-premium-note="${q.id}" placeholder="Add a private note for this question">${extra.notes?.[q.id] || ''}</textarea>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderInsights() {
  const sessions = allSessions();
  const scores = sessions.slice().reverse().map((s) => s.score);
  const recent = sessions[0];
  const recommended = [...domains].sort((a, b) => avgDomainScore(a) - avgDomainScore(b));
  return `
    <div class="premium-section">
      <h3>Performance insights</h3>
      <div class="premium-panel">
        <div class="premium-row" style="justify-content: space-between; align-items: center;">
          <div>
            <div class="premium-meta">Trend line</div>
            <div style="font-size:18px;font-weight:800;margin-top:4px;">${recent ? `${recent.score}% latest score` : 'No exam data yet'}</div>
          </div>
          <div class="badge">${sessions.length} runs</div>
        </div>
        <div class="premium-spark" style="margin-top:12px;">
          ${sparkline(scores)}
        </div>
      </div>
    </div>
    <div class="premium-section">
      <h3>Domain performance</h3>
      <div class="premium-list">
        ${domains.map((domainName) => {
          const score = avgDomainScore(domainName);
          return `
            <div class="premium-item">
              <div class="premium-item-top">
                <div>
                  <div style="font-size:15px;font-weight:800;">${domainName}</div>
                  <div class="premium-meta">Average across saved sessions</div>
                </div>
                <div class="badge">${score}%</div>
              </div>
              <div class="meter" style="margin-top:10px;"><i style="width:${score}%"></i></div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="premium-section">
      <h3>Study recommendations</h3>
      <div class="premium-panel">
        <div class="premium-badge-line">
          <span class="premium-chip">Priority 1: ${recommended[0]}</span>
          <span class="premium-chip">Priority 2: ${recommended[1]}</span>
          <span class="premium-chip">Priority 3: ${recommended[2]}</span>
        </div>
        <p style="margin-top:12px;color:#c8d4e0;line-height:1.5;">Run a focused drill on the lowest domain, then repeat a timed exam and compare the new session against the trend line.</p>
      </div>
    </div>
  `;
}

function renderExport() {
  return `
    <div class="premium-section">
      <h3>Export and import</h3>
      <div class="premium-panel">
        <div class="premium-row">
          <button class="btn" data-premium-action="export">Export JSON</button>
          <button class="btn ghost" data-premium-action="import">Import JSON</button>
          <button class="btn warn" data-premium-action="reset-premium">Reset premium data</button>
        </div>
        <div class="premium-divider"></div>
        <div class="premium-meta">This export includes the main app state and premium bookmarks / notes.</div>
        <div class="premium-meta" style="margin-top:6px;">You can move study progress between devices by importing the JSON file.</div>
      </div>
    </div>
    <div class="premium-section">
      <h3>Quick actions</h3>
      <div class="premium-row">
        <button class="btn" data-premium-action="open-dashboard">Dashboard</button>
        <button class="btn ghost" data-premium-action="open-practice">Practice</button>
        <button class="btn ghost" data-premium-action="open-exam">Exam</button>
        <button class="btn ghost" data-premium-action="open-reports">Reports</button>
        <button class="btn ghost" data-premium-action="open-sessions">Sessions</button>
      </div>
    </div>
  `;
}

function renderModal() {
  ensureModal();
  const tabs = document.querySelector('#premium-tabs');
  const content = document.querySelector('#premium-content');
  if (!tabs || !content) return;
  const active = extra.mode || 'overview';
  tabs.innerHTML = renderTabs();
  if (active === 'overview') content.innerHTML = renderOverview();
  else if (active === 'bank') content.innerHTML = renderBank();
  else if (active === 'insights') content.innerHTML = renderInsights();
  else content.innerHTML = renderExport();
}

function injectDashboardCard() {
  const tabArea = document.querySelector('#tabArea');
  if (!tabArea) return;
  const heading = tabArea.querySelector('h3');
  if (!heading || heading.textContent !== 'Dashboard') return;
  if (tabArea.querySelector('[data-premium-dashboard-card]')) return;
  const card = document.createElement('div');
  card.setAttribute('data-premium-dashboard-card', 'true');
  card.className = 'premium-panel';
  card.innerHTML = `
    <div class="premium-row" style="justify-content: space-between; align-items: flex-start;">
      <div>
        <div class="premium-meta">Premium layer</div>
        <div style="font-size:18px;font-weight:800;margin-top:4px;">Question bank, insights, and export tools</div>
      </div>
      <div class="badge">Ultra premium</div>
    </div>
    <div class="premium-badge-line">
      <span class="premium-chip">Bookmarks: ${(extra.bookmarks || []).length}</span>
      <span class="premium-chip">Notes: ${Object.keys(extra.notes || {}).length}</span>
      <span class="premium-chip">Sessions: ${allSessions().length}</span>
    </div>
    <div class="premium-row" style="margin-top:12px;">
      <button class="btn" data-premium-action="open-modal">Open Premium Center</button>
      <button class="btn ghost" data-premium-action="open-bank">Question Bank</button>
      <button class="btn ghost" data-premium-action="open-insights">Insights</button>
    </div>
  `;
  tabArea.insertBefore(card, tabArea.children[2] || null);
}

function renderAll() {
  refreshMainState();
  ensureLauncher();
  injectDashboardCard();
  if (document.querySelector('#premium-modal')?.classList.contains('open')) {
    renderModal();
  }
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-premium-action]')?.dataset.premiumAction;
  if (!action) return;
  if (action === 'open-modal') openModal('overview');
  if (action === 'open-bank') openModal('bank');
  if (action === 'open-insights') openModal('insights');
  if (action === 'open-dashboard') pushAppTab('dashboard');
  if (action === 'open-practice') pushAppTab('practice');
  if (action === 'open-exam') pushAppTab('exam');
  if (action === 'open-reports') pushAppTab('reports');
  if (action === 'open-sessions') pushAppTab('sessions');
  if (action === 'close-modal') closeModal();
  if (action === 'quick-drill') {
    pushAppTab('practice');
    closeModal();
  }
  if (action === 'export') exportJson();
  if (action === 'import') document.querySelector('#premium-file')?.click();
  if (action === 'reset-premium') {
    if (confirm('Reset premium bookmarks and notes only?')) {
      extra = { bookmarks: [], notes: {}, mode: extra.mode || 'overview' };
      saveExtra(extra);
      renderAll();
      renderModal();
    }
  }
  if (action === 'toggle-bookmarks') {
    extra.onlyBookmarks = !extra.onlyBookmarks;
    saveExtra(extra);
    renderModal();
  }
});

document.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-premium-tab]')?.dataset.premiumTab;
  if (!tab) return;
  extra.mode = tab;
  saveExtra(extra);
  renderModal();
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'premium-search') {
    extra.query = event.target.value;
    saveExtra(extra);
    renderModal();
    return;
  }
  const noteId = event.target.closest('[data-premium-note]')?.dataset.premiumNote;
  if (noteId) {
    saveNote(Number(noteId), event.target.value);
  }
});

document.addEventListener('click', (event) => {
  const bookmarkId = event.target.closest('[data-premium-bookmark]')?.dataset.premiumBookmark;
  if (!bookmarkId) return;
  toggleBookmark(Number(bookmarkId));
});

document.addEventListener('change', async (event) => {
  if (event.target.id === 'premium-file') {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importJson(file);
      closeModal();
      alert('Import completed successfully.');
    } catch {
      alert('Import failed. The file must be a valid Exam Hall export.');
    } finally {
      event.target.value = '';
    }
    return;
  }
  const domain = event.target.closest('[data-premium-domain]')?.dataset.premiumDomain;
  if (domain) {
    extra.domain = domain;
    saveExtra(extra);
    renderModal();
    return;
  }
  const difficulty = event.target.closest('[data-premium-difficulty]')?.dataset.premiumDifficulty;
  if (difficulty) {
    extra.difficulty = difficulty;
    saveExtra(extra);
    renderModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
  if (event.key === '/' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    openModal('bank');
  }
});

const observer = new MutationObserver(() => renderAll());
observer.observe(document.documentElement, { childList: true, subtree: true });

setTimeout(renderAll, 0);
