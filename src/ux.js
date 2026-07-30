const UX_KEY = 'exam-hall-ux-v1';

const style = document.createElement('style');
style.textContent = `
  html[data-theme='light'] {
    --bg: #eef4fb;
    --bg2: #dfe9f5;
    --line: #c8d4e1;
    --text: #09101a;
    --muted: #52657c;
    --shadow: 0 18px 55px rgba(40, 64, 85, 0.12);
  }
  html[data-theme='light'] body {
    background: radial-gradient(circle at top, var(--bg2), var(--bg));
  }
  html[data-theme='light'] .hero,
  html[data-theme='light'] .panel,
  html[data-theme='light'] .side,
  html[data-theme='light'] .card,
  html[data-theme='light'] .item,
  html[data-theme='light'] .reportBox,
  html[data-theme='light'] .sessionCard {
    background: rgba(255,255,255,.78) !important;
  }
  html[data-theme='light'] .badge,
  html[data-theme='light'] .tag,
  html[data-theme='light'] .premium-chip,
  html[data-theme='light'] .premium-tab,
  html[data-theme='light'] .chart-label,
  html[data-theme='light'] .chart-badge,
  html[data-theme='light'] .meta,
  html[data-theme='light'] .small,
  html[data-theme='light'] .premium-meta {
    color: #42566c !important;
  }
  html[data-theme='light'] .option,
  html[data-theme='light'] .field,
  html[data-theme='light'] .auth-field,
  html[data-theme='light'] .premium-search,
  html[data-theme='light'] .premium-note {
    background: #f6f9fc !important;
    color: #09101a !important;
  }
  body.ux-collapsed .layout {
    grid-template-columns: 92px minmax(0, 1fr);
  }
  body.ux-collapsed .side {
    overflow: hidden;
  }
  body.ux-collapsed .navbtn strong,
  body.ux-collapsed .navbtn span,
  body.ux-collapsed .navbtn span:last-child {
    display: none;
  }
  body.ux-collapsed .navbtn {
    justify-content: center;
  }
  .ux-top-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .ux-icon-btn {
    min-width: 42px;
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid #2f516b;
    border-radius: 14px;
    background: rgba(255,255,255,.04);
    color: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .ux-command {
    position: fixed;
    inset: 0;
    z-index: 220;
    display: none;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8vh;
    background: rgba(0,0,0,.5);
    backdrop-filter: blur(12px);
  }
  .ux-command.open { display: flex; }
  .ux-command-shell {
    width: min(760px, calc(100vw - 24px));
    border: 1px solid #35546d;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(11,24,38,.98), rgba(8,17,27,.98));
    box-shadow: 0 30px 120px rgba(0,0,0,.55);
    overflow: hidden;
  }
  .ux-command-head {
    padding: 14px;
    border-bottom: 1px solid #203346;
  }
  .ux-command-input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid #274053;
    background: #0c1723;
    color: #eef4fb;
    outline: none;
  }
  .ux-command-list { max-height: 56vh; overflow: auto; padding: 12px; }
  .ux-command-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid transparent;
    background: transparent;
    color: inherit;
    text-align: left;
  }
  .ux-command-item:hover,
  .ux-command-item.active {
    border-color: #2f516b;
    background: rgba(141,210,255,.12);
  }
  .ux-command-item strong { display: block; font-size: 14px; }
  .ux-command-item span { color: #95a8bd; font-size: 12px; }
  .ux-toast-host {
    position: fixed;
    right: 18px;
    top: 18px;
    z-index: 260;
    display: grid;
    gap: 10px;
  }
  .ux-toast {
    min-width: 240px;
    max-width: 360px;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid #35546d;
    background: rgba(11,24,38,.94);
    color: #eef4fb;
    box-shadow: 0 18px 55px rgba(0,0,0,.28);
  }
  .ux-toast .title { font-weight: 800; margin-bottom: 4px; }
  .ux-toast .body { color: #b0c0d2; font-size: 12px; line-height: 1.45; }
  .ux-stack {
    display: grid;
    gap: 12px;
  }
  .ux-hero-strip {
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    gap: 12px;
    margin-bottom: 12px;
  }
  .ux-hero-card {
    padding: 16px;
    border: 1px solid #233648;
    border-radius: 20px;
    background: rgba(255,255,255,.03);
  }
  .ux-hero-card h4 { margin: 0 0 8px; font-size: 14px; }
  .ux-hero-card p { margin: 0; color: #c8d4e0; font-size: 13px; line-height: 1.5; }
  .ux-divider { height: 1px; background: #203346; margin: 12px 0; }
  @media (max-width: 1060px) {
    .ux-hero-strip { grid-template-columns: 1fr; }
    body.ux-collapsed .layout { grid-template-columns: 1fr; }
  }
`;
document.head.appendChild(style);

function loadPrefs() {
  try {
    const raw = localStorage.getItem(UX_KEY);
    return raw ? JSON.parse(raw) : { theme: 'dark', sidebarCollapsed: false };
  } catch {
    return { theme: 'dark', sidebarCollapsed: false };
  }
}

function savePrefs(prefs) {
  localStorage.setItem(UX_KEY, JSON.stringify(prefs));
}

let prefs = loadPrefs();

function applyTheme() {
  document.documentElement.dataset.theme = prefs.theme;
  document.body.classList.toggle('ux-collapsed', !!prefs.sidebarCollapsed);
  savePrefs(prefs);
}

function toast(title, body) {
  const host = document.querySelector('#ux-toast-host') || (() => {
    const el = document.createElement('div');
    el.id = 'ux-toast-host';
    el.className = 'ux-toast-host';
    document.body.appendChild(el);
    return el;
  })();
  const node = document.createElement('div');
  node.className = 'ux-toast';
  node.innerHTML = `<div class="title">${title}</div><div class="body">${body}</div>`;
  host.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function ensureTopActions() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || topbar.querySelector('.ux-top-actions')) return;
  const actions = document.createElement('div');
  actions.className = 'ux-top-actions';
  actions.innerHTML = `
    <button class="ux-icon-btn" data-ux-action="toggle-theme" title="Toggle theme">Theme</button>
    <button class="ux-icon-btn" data-ux-action="toggle-sidebar" title="Toggle sidebar">Sidebar</button>
    <button class="ux-icon-btn" data-ux-action="open-command" title="Open command palette">Ctrl K</button>
  `;
  topbar.appendChild(actions);
}

function ensureCommandPalette() {
  if (document.querySelector('#ux-command')) return;
  const palette = document.createElement('div');
  palette.id = 'ux-command';
  palette.className = 'ux-command';
  palette.innerHTML = `
    <div class="ux-command-shell" role="dialog" aria-modal="true" aria-labelledby="ux-command-title">
      <div class="ux-command-head">
        <input id="ux-command-input" class="ux-command-input" placeholder="Search actions, tabs, or tools..." autocomplete="off" />
      </div>
      <div class="ux-command-list" id="ux-command-list"></div>
    </div>
  `;
  palette.addEventListener('click', (event) => {
    if (event.target === palette) closeCommand();
  });
  document.body.appendChild(palette);
}

function openCommand() {
  ensureCommandPalette();
  const el = document.querySelector('#ux-command');
  if (!el) return;
  el.classList.add('open');
  renderCommand('');
  setTimeout(() => document.querySelector('#ux-command-input')?.focus(), 0);
}

function closeCommand() {
  document.querySelector('#ux-command')?.classList.remove('open');
}

function commandActions() {
  return [
    { label: 'Go to Dashboard', hint: 'Open the home view', run: () => clickTab('dashboard') },
    { label: 'Open Learning Plan', hint: 'Lessons and pacing', run: () => clickTab('plan') },
    { label: 'Start Practice', hint: 'Question bank drill', run: () => clickTab('practice') },
    { label: 'Launch Mock Exam', hint: 'Timed simulator', run: () => clickTab('exam') },
    { label: 'Open Reports', hint: 'Score breakdown', run: () => clickTab('reports') },
    { label: 'Open Sessions', hint: 'Trend history', run: () => clickTab('sessions') },
    { label: 'Open Premium Center', hint: 'Bookmarks and export tools', run: () => clickPremium() },
    { label: 'Toggle Theme', hint: 'Dark / light', run: toggleTheme },
    { label: 'Toggle Sidebar', hint: 'Collapse layout', run: toggleSidebar },
    { label: 'Demo Access', hint: 'Unlock local session', run: demoAccess },
  ];
}

function clickTab(tab) {
  const button = document.querySelector(`[data-tab="${tab}"]`);
  if (button) button.click();
}

function clickPremium() {
  const button = document.querySelector('#premium-launcher');
  if (button) button.click();
}

function toggleTheme() {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  toast('Theme updated', `Switched to ${prefs.theme} mode.`);
}

function toggleSidebar() {
  prefs.sidebarCollapsed = !prefs.sidebarCollapsed;
  applyTheme();
  toast('Sidebar updated', prefs.sidebarCollapsed ? 'Sidebar collapsed.' : 'Sidebar expanded.');
}

function demoAccess() {
  const demoBtn = document.querySelector('#auth-demo');
  if (demoBtn) demoBtn.click();
  toast('Demo access', 'Local demo profile enabled.');
}

function renderCommand(query) {
  const list = document.querySelector('#ux-command-list');
  if (!list) return;
  const actions = commandActions().filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(query.toLowerCase()));
  list.innerHTML = actions.map((a, index) => `
    <button class="ux-command-item ${index === 0 ? 'active' : ''}" data-run-action="${index}">
      <div><strong>${a.label}</strong><span>${a.hint}</span></div>
      <span>↵</span>
    </button>
  `).join('') || `<div class="premium-meta" style="padding:12px;">No actions found.</div>`;
  list.querySelectorAll('[data-run-action]').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      actions[index]?.run();
      closeCommand();
    });
  });
}

function injectHeroStrip() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('[data-ux-hero]')) return;
  const state = (() => {
    try {
      const raw = localStorage.getItem('exam-hall-state-v4') || localStorage.getItem('exam-hall-state-v3') || localStorage.getItem('exam-hall-state-v2') || localStorage.getItem('exam-hall-state-v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();
  const last = Array.isArray(state.examHistory) ? state.examHistory[0] : null;
  const completed = Array.isArray(state.completedLessons) ? state.completedLessons.length : 0;
  const saved = Array.isArray(state.savedQuestions) ? state.savedQuestions.length : 0;
  const strip = document.createElement('div');
  strip.setAttribute('data-ux-hero', 'true');
  strip.className = 'ux-hero-strip';
  strip.innerHTML = `
    <div class="ux-hero-card">
      <h4>Current profile</h4>
      <p>${state.name || 'Learner'} • ${state.email || 'No email set'}<br>Lessons: ${completed} • Saved: ${saved} • Last score: ${last ? `${last.score}%` : '—'}</p>
    </div>
    <div class="ux-hero-card">
      <h4>Quick controls</h4>
      <p>Use the top actions, or press <strong>Ctrl+K</strong> to open the command palette.</p>
    </div>
  `;
  hero.insertBefore(strip, hero.children[2] || null);
}

function enhanceSessionHistory() {
  const panel = document.querySelector('#tabArea');
  if (!panel || !panel.textContent.includes('Session History')) return;
  if (panel.querySelector('[data-ux-session-tools]')) return;
  const tools = document.createElement('div');
  tools.setAttribute('data-ux-session-tools', 'true');
  tools.className = 'premium-panel';
  tools.innerHTML = `
    <div class="premium-row" style="justify-content:space-between;align-items:center;">
      <div>
        <div class="premium-meta">Session tools</div>
        <div style="font-size:16px;font-weight:800;margin-top:4px;">Trend comparison and fast review</div>
      </div>
      <button class="btn ghost" id="ux-open-command">Open command palette</button>
    </div>
    <div class="premium-badge-line">
      <span class="premium-chip">Ctrl+K search</span>
      <span class="premium-chip">Theme toggle</span>
      <span class="premium-chip">Sidebar collapse</span>
    </div>
  `;
  panel.insertBefore(tools, panel.children[2] || null);
  tools.querySelector('#ux-open-command')?.addEventListener('click', openCommand);
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-ux-action]')?.dataset.uxAction;
    if (!action) return;
    if (action === 'toggle-theme') toggleTheme();
    if (action === 'toggle-sidebar') toggleSidebar();
    if (action === 'open-command') openCommand();
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openCommand();
    }
    if (event.key === 'Escape') closeCommand();
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'ux-command-input') {
      renderCommand(event.target.value || '');
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('#ux-command')) return;
    if (document.querySelector('#ux-command')?.classList.contains('open')) {
      const shell = event.target.closest('.ux-command-shell');
      const opened = document.querySelector('#ux-command');
      if (opened && !shell) closeCommand();
    }
  });
}

function boot() {
  applyTheme();
  ensureTopActions();
  ensureCommandPalette();
  injectHeroStrip();
  enhanceSessionHistory();
  bindEvents();
  setInterval(() => {
    ensureTopActions();
    injectHeroStrip();
    enhanceSessionHistory();
  }, 1600);
}

boot();
