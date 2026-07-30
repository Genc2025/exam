import { domains, lessons, practiceQuestions, flashcards } from './data.js';

const STORAGE = {
  state: 'exam-hall-state-ultra-v1',
  prefs: 'exam-hall-prefs-ultra-v1',
  auth: 'exam-hall-auth-ultra-v1',
};

const app = document.querySelector('#app');

const defaultState = {
  tab: 'dashboard',
  savedQuestions: [],
  completedLessons: [],
  bookmarks: [],
  notes: {},
  activityLog: [],
  examHistory: [],
  streak: 7,
  goal: 85,
  currentPractice: 0,
  practiceChoice: null,
  practiceConfidence: 3,
  examRunning: false,
  examSeconds: 75 * 60,
  examIndex: 0,
  examAnswers: {},
  examConfidence: {},
  examFlags: {},
  examPool: [],
  reviewMode: false,
  reviewIndex: 0,
  missionsDone: {},
  notifications: true,
  offlineMode: true,
  cloudSync: false,
  premiumSearch: '',
  premiumFilterDomain: 'All',
  premiumFilterDifficulty: 'All',
  premiumBookmarksOnly: false,
  profile: { name: 'Learner', email: 'demo@exam.local' },
};

const defaultPrefs = { theme: 'dark', sidebarCollapsed: false };
const defaultAuth = { unlocked: false };

let state = loadAny(STORAGE.state, defaultState);
let prefs = loadAny(STORAGE.prefs, defaultPrefs);
let auth = loadAny(STORAGE.auth, defaultAuth);
let timerHandle = null;
let commandOpen = false;
let commandQuery = '';
let commandIndex = 0;

function loadAny(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    return { ...structuredClone(fallback), ...JSON.parse(raw) };
  } catch {
    return structuredClone(fallback);
  }
}

function saveState() { localStorage.setItem(STORAGE.state, JSON.stringify(state)); }
function savePrefs() { localStorage.setItem(STORAGE.prefs, JSON.stringify(prefs)); }
function saveAuth() { localStorage.setItem(STORAGE.auth, JSON.stringify(auth)); }

const styles = document.createElement('style');
styles.textContent = `
  :root {
    --bg: #07111a;
    --bg2: #0b1826;
    --line: #22364a;
    --text: #eef4fb;
    --muted: #95a8bd;
    --accent: #8dd2ff;
    --accent2: #79ffa8;
    --warn: #ffd479;
    --danger: #ff8a8a;
    --shadow: 0 18px 55px rgba(0,0,0,.28);
    --radius: 24px;
  }
  html[data-theme='light'] {
    --bg: #eef4fb;
    --bg2: #dfe9f5;
    --line: #d0dbe6;
    --text: #0a1220;
    --muted: #4d6179;
    --shadow: 0 18px 55px rgba(45,69,91,.12);
  }
  html, body { margin: 0; min-height: 100%; background: radial-gradient(circle at top, var(--bg2), var(--bg)); color: var(--text); font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  * { box-sizing: border-box; }
  button, input, textarea, select { font: inherit; }
  button { cursor: pointer; }
  body.eh-collapsed .eh-layout { grid-template-columns: 96px minmax(0, 1fr); }
  body.eh-collapsed .eh-sidebar .eh-nav-text, body.eh-collapsed .eh-sidebar .eh-nav-note, body.eh-collapsed .eh-sidebar .eh-nav-index { display: none; }
  body.eh-collapsed .eh-nav-btn { justify-content: center; }
  .eh-shell { max-width: 1460px; margin: auto; min-height: 100vh; padding: 18px 18px 104px; }
  .eh-topbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 18px; }
  .eh-brand { display:flex; align-items:center; gap:12px; }
  .eh-logo { width: 48px; height: 48px; border-radius: 16px; border:1px solid #35546d; display:grid; place-items:center; background: linear-gradient(145deg, rgba(141,210,255,.18), rgba(121,255,168,.08)); box-shadow: var(--shadow); }
  .eh-logo svg { width: 24px; height: 24px; fill: var(--accent); }
  .eh-brand h1 { margin:0; font-size: 18px; letter-spacing:-.03em; }
  .eh-brand p { margin: 3px 0 0; color: var(--muted); font-size: 12px; }
  .eh-chip { padding: 9px 12px; border:1px solid var(--line); border-radius: 999px; background: rgba(255,255,255,.04); color: var(--muted); font-size: 12px; }
  .eh-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:flex-end; }
  .eh-btn { min-height: 42px; padding: 0 14px; border-radius: 14px; border:1px solid #2f516b; background: rgba(255,255,255,.04); color: var(--text); display:inline-flex; align-items:center; gap:8px; }
  .eh-btn.primary { background: linear-gradient(145deg, rgba(141,210,255,.20), rgba(121,255,168,.10)); }
  .eh-btn.ghost { background: rgba(255,255,255,.02); }
  .eh-layout { display:grid; grid-template-columns: 270px minmax(0, 1fr); gap: 18px; }
  .eh-sidebar { position: sticky; top: 18px; align-self:start; padding: 14px; border:1px solid var(--line); border-radius: 28px; background: rgba(255,255,255,.03); box-shadow: var(--shadow); }
  .eh-nav-btn { width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding: 12px 14px; margin: 6px 0; border-radius: 16px; border:1px solid transparent; background: transparent; color: var(--text); text-align:left; }
  .eh-nav-btn:hover { background: rgba(255,255,255,.03); border-color: #2c4a61; }
  .eh-nav-btn.active { border-color: #35546d; background: linear-gradient(145deg, rgba(141,210,255,.16), rgba(121,255,168,.08)); }
  .eh-nav-main { display:flex; align-items:center; gap:10px; }
  .eh-nav-icon { width: 34px; height: 34px; border-radius: 12px; display:grid; place-items:center; background: rgba(141,210,255,.12); border:1px solid #2e4f67; font-size: 14px; }
  .eh-nav-text { display:block; font-size: 14px; font-weight: 700; }
  .eh-nav-note { display:block; margin-top:2px; color: var(--muted); font-size: 11px; }
  .eh-nav-index { color: var(--muted); font-size: 11px; }
  .eh-main { min-width: 0; }
  .eh-hero { padding: 22px; border:1px solid var(--line); border-radius: 30px; background: linear-gradient(160deg, rgba(255,255,255,.07), rgba(255,255,255,.02)); box-shadow: var(--shadow); overflow:hidden; position:relative; }
  .eh-hero:before { content:''; position:absolute; inset:-70px -60px auto auto; width:320px; height:320px; border-radius:50%; background: radial-gradient(circle, rgba(141,210,255,.15), transparent 66%); pointer-events:none; }
  .eh-hero-head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
  .eh-eyebrow { display:inline-flex; gap:8px; align-items:center; padding:7px 10px; border:1px solid #35546d; border-radius:999px; color: var(--accent); font-size: 11px; letter-spacing:.12em; text-transform:uppercase; background: rgba(13,25,38,.68); }
  .eh-hero h2 { margin: 14px 0 10px; font-size: 38px; line-height: 1.02; letter-spacing:-.04em; max-width: 820px; }
  .eh-hero p { max-width: 900px; margin:0; color:#b0c0d2; line-height:1.55; }
  .eh-profile-card { min-width: 250px; padding: 14px; border:1px solid var(--line); border-radius: 22px; background: rgba(10,18,28,.68); }
  .eh-profile-card h4 { margin:0; font-size:14px; }
  .eh-profile-card .meta { margin-top: 6px; color: var(--muted); font-size: 12px; line-height:1.45; }
  .eh-kpis { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-top: 18px; }
  .eh-kpi { padding: 16px; border:1px solid var(--line); border-radius: 22px; background: rgba(10,18,28,.78); box-shadow: var(--shadow); }
  .eh-kpi .label { color: var(--muted); font-size: 12px; }
  .eh-kpi .value { margin-top: 8px; font-size: 28px; font-weight: 800; letter-spacing:-.04em; }
  .eh-kpi .sub { margin-top: 6px; color:#9db1c7; font-size: 12px; }
  .eh-grid-2 { display:grid; grid-template-columns: 1.08fr .92fr; gap: 18px; margin-top: 18px; }
  .eh-panel { padding: 18px; border:1px solid var(--line); border-radius: 28px; background: rgba(10,18,28,.82); box-shadow: var(--shadow); }
  .eh-panel h3 { margin:0 0 12px; font-size: 18px; }
  .eh-sub { margin:0 0 14px; color: var(--muted); font-size: 13px; line-height:1.5; }
  .eh-metrics { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
  .eh-metric { padding:14px; border:1px solid #233648; border-radius:18px; background: rgba(255,255,255,.03); }
  .eh-metric .head { display:flex; justify-content:space-between; gap:10px; align-items:center; }
  .eh-metric .title { font-size: 13px; font-weight: 700; }
  .eh-metric .score { font-size: 16px; font-weight: 800; }
  .eh-meter { margin-top: 10px; height: 10px; border-radius: 999px; background: #102131; border:1px solid #24394d; overflow:hidden; }
  .eh-meter > i { display:block; height:100%; width: 0%; border-radius:999px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .eh-hero-strip { margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .eh-hero-card { padding: 14px; border:1px solid #233648; border-radius: 20px; background: rgba(255,255,255,.03); }
  .eh-hero-card h4 { margin:0 0 8px; font-size: 14px; }
  .eh-hero-card p { margin:0; color: #c8d4e0; font-size: 13px; line-height:1.5; }
  .eh-calendar { display:grid; grid-template-columns: repeat(7, minmax(0,1fr)); gap: 8px; }
  .eh-day { padding: 10px 8px; border:1px solid #233648; border-radius: 16px; background: rgba(255,255,255,.03); text-align:center; }
  .eh-day .d { color: var(--muted); font-size: 11px; }
  .eh-day .dot { width: 14px; height:14px; margin: 8px auto 0; border-radius: 50%; background: #314154; }
  .eh-day.active .dot { background: var(--accent2); }
  .eh-list { display:grid; gap: 10px; }
  .eh-item { padding: 14px; border:1px solid #233648; border-radius: 18px; background: rgba(255,255,255,.03); }
  .eh-item-top { display:flex; justify-content:space-between; gap: 10px; align-items:flex-start; }
  .eh-item b { display:block; font-size: 14px; margin-bottom:4px; }
  .eh-meta { color: var(--muted); font-size: 12px; }
  .eh-badge { padding: 6px 9px; border-radius: 999px; border:1px solid #2f516b; background: rgba(141,210,255,.12); color: #d5efff; font-size: 11px; white-space: nowrap; }
  .eh-text { margin: 10px 0 0; color:#c8d4e0; font-size: 13px; line-height:1.55; }
  .eh-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
  .eh-field { width:100%; padding: 12px 14px; border:1px solid #274053; border-radius: 16px; background: #0c1723; color: var(--text); outline: none; }
  .eh-options { display:grid; gap: 8px; margin-top: 10px; }
  .eh-option { width:100%; text-align:left; padding: 11px 12px; border-radius: 14px; border:1px solid #26384a; background:#0b1621; color: var(--text); }
  .eh-option.correct { border-color:#2f7d5a; background: rgba(121,255,168,.1); }
  .eh-option.wrong { border-color:#8a4f4f; background: rgba(255,138,138,.08); }
  .eh-split { display:grid; grid-template-columns: 1.2fr .8fr; gap: 12px; }
  .eh-stick { position: sticky; top: 18px; }
  .eh-bottom-nav { display:none; position:fixed; left:50%; bottom:0; transform:translateX(-50%); width:min(1460px,100%); padding:10px 14px calc(10px + env(safe-area-inset-bottom)); background: rgba(8,15,23,.88); backdrop-filter: blur(18px); border-top:1px solid #203346; z-index: 40; }
  .eh-bottom-nav .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .eh-bottom-nav button { min-height: 40px; border:1px solid #22384c; border-radius: 14px; background:#0c1723; color: var(--text); font-size: 11px; }
  .eh-breadcrumb { color: var(--muted); font-size: 12px; }
  .eh-radar { width:100%; height: 280px; }
  .eh-chipline { display:flex; gap:8px; flex-wrap:wrap; }
  .eh-chipline .chip2 { padding: 7px 10px; border:1px solid #233648; border-radius:999px; background:#0b1621; color:#c8d4e0; font-size:11px; }
  .eh-timeline { display:grid; gap: 10px; }
  .eh-timeline-item { padding: 12px 14px; border:1px solid #233648; border-radius: 18px; background: rgba(255,255,255,.03); }
  .eh-command { position:fixed; inset:0; display:none; z-index: 240; background: rgba(0,0,0,.52); backdrop-filter: blur(12px); }
  .eh-command.open { display:grid; place-items:center; }
  .eh-command-shell { width:min(760px, calc(100vw - 24px)); border:1px solid #35546d; border-radius: 24px; overflow:hidden; background: linear-gradient(180deg, rgba(11,24,38,.98), rgba(8,17,27,.98)); box-shadow: 0 30px 120px rgba(0,0,0,.55); }
  .eh-command-head { padding: 14px; border-bottom:1px solid #203346; }
  .eh-command-list { max-height: 56vh; overflow:auto; padding: 12px; }
  .eh-command-item { width:100%; display:flex; justify-content:space-between; gap:10px; align-items:center; padding: 12px 14px; border:1px solid transparent; border-radius: 14px; background: transparent; color: var(--text); text-align:left; }
  .eh-command-item:hover, .eh-command-item.active { border-color:#2f516b; background: rgba(141,210,255,.12); }
  .eh-command-item strong { display:block; font-size:14px; }
  .eh-command-item span { color: var(--muted); font-size: 12px; }
  .eh-toast-host { position:fixed; right:18px; top:18px; z-index: 260; display:grid; gap:10px; }
  .eh-toast { min-width: 240px; max-width: 360px; padding: 12px 14px; border-radius: 16px; border:1px solid #35546d; background: rgba(11,24,38,.94); box-shadow: var(--shadow); }
  .eh-toast .t { font-weight: 800; margin-bottom: 4px; }
  .eh-toast .b { color:#b0c0d2; font-size:12px; line-height:1.45; }
  .eh-auth { position:fixed; inset:0; z-index: 300; display:none; place-items:center; background: radial-gradient(circle at top, rgba(11,24,38,.96), rgba(7,17,26,.98)); backdrop-filter: blur(12px); }
  .eh-auth.open { display:grid; }
  .eh-auth-shell { width:min(560px, calc(100vw - 24px)); border:1px solid #35546d; border-radius: 28px; background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)); box-shadow: 0 30px 120px rgba(0,0,0,.55); overflow:hidden; }
  .eh-auth-hero { padding: 26px 24px 20px; border-bottom:1px solid #203346; }
  .eh-auth-hero h2 { margin:0; font-size: 28px; letter-spacing:-.04em; }
  .eh-auth-hero p { margin:10px 0 0; color:#b0c0d2; line-height:1.5; }
  .eh-auth-body { padding: 20px 24px 24px; display:grid; gap: 12px; }
  .eh-auth-row { display:flex; gap:10px; flex-wrap:wrap; }
  .eh-missions { display:grid; gap: 10px; }
  .eh-mission { padding: 12px 14px; border:1px solid #233648; border-radius: 18px; background: rgba(255,255,255,.03); }
  .eh-achievements { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
  .eh-ach { padding: 14px; border:1px solid #233648; border-radius: 18px; background: rgba(255,255,255,.03); }
  .eh-ach .x { font-size: 24px; }
  .eh-ach .n { margin-top: 8px; font-weight: 800; }
  .eh-ach .d { margin-top: 4px; color: var(--muted); font-size:12px; line-height:1.45; }
  .eh-modal { position:fixed; inset:0; z-index: 220; display:none; background: rgba(0,0,0,.50); backdrop-filter: blur(12px); }
  .eh-modal.open { display:grid; place-items:center; }
  .eh-modal-shell { width:min(1080px, calc(100vw - 24px)); max-height: calc(100vh - 24px); overflow:auto; border:1px solid #35546d; border-radius: 28px; background: linear-gradient(180deg, rgba(11,24,38,.98), rgba(8,17,27,.98)); box-shadow: 0 30px 120px rgba(0,0,0,.55); }
  .eh-modal-head { position:sticky; top:0; display:flex; justify-content:space-between; gap:12px; align-items:center; padding: 18px 20px; border-bottom:1px solid #203346; background: rgba(10,18,28,.92); }
  .eh-modal-body { padding: 18px 20px 20px; }
  .eh-tabs { display:flex; gap:8px; flex-wrap:wrap; }
  .eh-tab { padding: 9px 12px; border-radius:999px; border:1px solid #2f516b; background: rgba(255,255,255,.03); color: var(--text); font-size:12px; }
  .eh-tab.active { background: rgba(141,210,255,.15); }
  .eh-fullbar { width:100%; height: 12px; border-radius: 999px; background: #102131; border:1px solid #24394d; overflow:hidden; }
  .eh-fullbar > i { display:block; height:100%; width:0%; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .eh-small { font-size: 12px; color: var(--muted); }
  @media (max-width: 1180px) {
    .eh-kpis, .eh-grid-2, .eh-hero-strip, .eh-split, .eh-achievements { grid-template-columns: 1fr; }
    .eh-layout { grid-template-columns: 1fr; }
    .eh-sidebar, body.eh-collapsed .eh-sidebar { display:none; }
    .eh-bottom-nav { display:block; }
    .eh-hero h2 { font-size: 30px; }
    .eh-shell { padding-bottom: 110px; }
  }
`;
document.head.appendChild(styles);

function applyPrefs() {
  document.documentElement.dataset.theme = prefs.theme;
  document.body.classList.toggle('eh-collapsed', !!prefs.sidebarCollapsed);
  savePrefs();
}

function toast(title, body, timeout = 2400) {
  let host = document.querySelector('#eh-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'eh-toast-host';
    host.className = 'eh-toast-host';
    document.body.appendChild(host);
  }
  const node = document.createElement('div');
  node.className = 'eh-toast';
  node.innerHTML = `<div class="t">${title}</div><div class="b">${body}</div>`;
  host.appendChild(node);
  setTimeout(() => node.remove(), timeout);
}

function logActivity(label) {
  state.activityLog.unshift({ id: crypto.randomUUID(), date: new Date().toISOString(), label });
  state.activityLog = state.activityLog.slice(0, 80);
  saveState();
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function fmtDate(dateString) { return new Date(dateString).toLocaleString(); }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }
function scoreToGauge(score) { return `conic-gradient(var(--accent) 0 ${score}%, rgba(255,255,255,.08) ${score}% 100%)`; }

function readinessScore() {
  const lessonPct = pct(state.completedLessons.length, lessons.length);
  const savedPct = pct(state.savedQuestions.length, practiceQuestions.length);
  const last = state.examHistory[0]?.score || 0;
  return clamp(Math.round((lessonPct * 0.32) + (savedPct * 0.18) + (last * 0.50)), 0, 100);
}

function sessionAverage() {
  if (!state.examHistory.length) return 0;
  return Math.round(state.examHistory.reduce((s, x) => s + x.score, 0) / state.examHistory.length);
}

function domainAverages() {
  const out = {};
  for (const domain of domains) {
    const vals = state.examHistory.map((s) => s.domainScores?.[domain]).filter((x) => Number.isFinite(x));
    out[domain] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : (domain === 'People' ? 68 : domain === 'Process' ? 64 : 70);
  }
  return out;
}

function weakestDomain() {
  const av = domainAverages();
  return Object.entries(av).sort((a, b) => a[1] - b[1])[0][0];
}

function currentQuestion() { return practiceQuestions[state.currentPractice % practiceQuestions.length]; }
function currentFlashcard() { return flashcards[state.currentPractice % flashcards.length]; }

function ensureExamPool() {
  if (!state.examPool.length) state.examPool = shuffle(practiceQuestions).slice(0, 12);
}

function startExam() {
  state.examRunning = true;
  state.reviewMode = false;
  state.examSeconds = 75 * 60;
  state.examIndex = 0;
  state.examAnswers = {};
  state.examConfidence = {};
  state.examFlags = {};
  state.examPool = shuffle(practiceQuestions).slice(0, 12);
  state.tab = 'exam';
  saveState();
  logActivity('Started a mock exam');
  render();
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    if (!state.examRunning) return;
    state.examSeconds -= 1;
    if (state.examSeconds <= 0) {
      state.examSeconds = 0;
      finishExam();
      return;
    }
    const timer = document.querySelector('#eh-exam-timer');
    if (timer) timer.textContent = formatTimer(state.examSeconds);
    saveState();
  }, 1000);
}

function formatTimer(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function finishExam() {
  const pool = state.examPool.length ? state.examPool : practiceQuestions.slice(0, 12);
  const correct = pool.filter((q, i) => state.examAnswers[i] === q.answer).length;
  const score = Math.round((correct / pool.length) * 100);
  const domainScores = {};
  for (const domain of domains) {
    const rows = pool.map((q, i) => ({ q, i })).filter((x) => x.q.domain === domain);
    const hit = rows.filter((x) => state.examAnswers[x.i] === x.q.answer).length;
    domainScores[domain] = rows.length ? Math.round((hit / rows.length) * 100) : 0;
  }
  state.examRunning = false;
  state.reviewMode = true;
  state.reviewIndex = 0;
  state.examHistory.unshift({ date: new Date().toISOString(), score, total: pool.length, domainScores, answers: state.examAnswers, confidence: state.examConfidence, flags: state.examFlags, pool });
  state.examHistory = state.examHistory.slice(0, 20);
  if (score >= state.goal) state.streak += 1;
  logActivity(`Finished exam with ${score}%`);
  saveState();
  render();
  toast('Exam complete', `Score saved: ${score}%`);
}

function completeLesson(id) {
  if (!state.completedLessons.includes(id)) state.completedLessons.push(id);
  logActivity(`Completed lesson: ${lessons.find((x) => x.id === id)?.title || id}`);
  saveState();
  render();
}

function toggleSaved(id) {
  const idx = state.savedQuestions.indexOf(id);
  if (idx >= 0) state.savedQuestions.splice(idx, 1); else state.savedQuestions.push(id);
  saveState();
  render();
}

function toggleBookmark(id) {
  const idx = state.bookmarks.indexOf(id);
  if (idx >= 0) state.bookmarks.splice(idx, 1); else state.bookmarks.push(id);
  saveState();
  render();
}

function missionList() {
  const weak = weakestDomain();
  const nextLesson = lessons.find((l) => !state.completedLessons.includes(l.id)) || lessons[0];
  return [
    { id: 'm1', title: `Finish ${nextLesson.title}`, sub: `Keep the plan moving in ${nextLesson.domain}.` },
    { id: 'm2', title: `Drill ${weak} questions`, sub: 'Focus on the weakest domain.' },
    { id: 'm3', title: 'Run a timed review', sub: 'Complete one exam or review session.' },
  ];
}

function dailyCalendar() {
  const activeDays = new Set(state.activityLog.map((a) => new Date(a.date).toISOString().slice(0, 10)));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), active: activeDays.has(key) });
  }
  return days;
}

function buildSpark(scores, width = 560, height = 150) {
  if (!scores.length) return `<div class="eh-small">No performance data yet.</div>`;
  const arr = scores.map((v) => clamp(Number(v) || 0, 0, 100));
  const step = arr.length > 1 ? width / (arr.length - 1) : width;
  const pts = arr.map((v, i) => [i * step, height - ((v / 100) * (height - 22)) - 10]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none"><defs><linearGradient id="ehSpark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#8dd2ff"/><stop offset="100%" stop-color="#79ffa8"/></linearGradient></defs><path d="${d}" fill="none" stroke="url(#ehSpark)" stroke-width="3"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#8dd2ff" />`).join('')}</svg>`;
}

function buildRadar() {
  const av = domainAverages();
  const values = [av.People, av.Process, av['Business Environment']];
  const cx = 140, cy = 140, r = 92;
  const points = values.map((v, i) => {
    const a = (-Math.PI / 2) + (i * (2 * Math.PI / 3));
    const rr = r * (v / 100);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const outline = [0,1,2].map((i) => {
    const a = (-Math.PI / 2) + (i * (2 * Math.PI / 3));
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  return `
    <svg class="eh-radar" viewBox="0 0 280 280">
      <g opacity=".35">
        <circle cx="140" cy="140" r="30" fill="none" stroke="var(--line)"/>
        <circle cx="140" cy="140" r="60" fill="none" stroke="var(--line)"/>
        <circle cx="140" cy="140" r="92" fill="none" stroke="var(--line)"/>
        <line x1="140" y1="140" x2="140" y2="48" stroke="var(--line)"/>
        <line x1="140" y1="140" x2="220" y2="186" stroke="var(--line)"/>
        <line x1="140" y1="140" x2="60" y2="186" stroke="var(--line)"/>
      </g>
      <polygon points="${points.map((p) => p.join(',')).join(' ')}" fill="rgba(141,210,255,.16)" stroke="var(--accent)" stroke-width="2"/>
      ${points.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#8dd2ff"/>`).join('')}
      <text x="140" y="36" text-anchor="middle" fill="var(--muted)" font-size="12">People ${values[0]}%</text>
      <text x="240" y="198" text-anchor="middle" fill="var(--muted)" font-size="12">Process ${values[1]}%</text>
      <text x="42" y="198" text-anchor="middle" fill="var(--muted)" font-size="12">Business ${values[2]}%</text>
    </svg>`;
}

function renderShell() {
  const activeLabel = navItems.find((n) => n.id === state.tab)?.label || 'Dashboard';
  app.innerHTML = `
    <div class="eh-shell">
      <header class="eh-topbar">
        <div class="eh-brand">
          <div class="eh-logo"><svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5.2-3.5 9.9-8 10-4.5-.1-8-4.8-8-10V6l8-4zm0 4.1L7 8v4c0 3.7 2.2 7 5 7s5-3.3 5-7V8l-5-1.9z"/></svg></div>
          <div>
            <h1>Exam Hall</h1>
            <p>Ultra-premium exam prep shell</p>
          </div>
        </div>
        <div class="eh-chip">${auth.unlocked ? `${state.profile.name} • ${state.profile.email || 'local profile'}` : 'Locked session'}</div>
        <div class="eh-actions">
          <button class="eh-btn ghost" data-action="command">Ctrl K</button>
          <button class="eh-btn ghost" data-action="theme">Theme</button>
          <button class="eh-btn ghost" data-action="sidebar">Sidebar</button>
          <button class="eh-btn primary" data-action="premium">Premium</button>
        </div>
      </header>

      <div class="eh-layout">
        <aside class="eh-sidebar">
          ${navItems.map((item, i) => `
            <button class="eh-nav-btn ${state.tab === item.id ? 'active' : ''}" data-nav="${item.id}">
              <div class="eh-nav-main">
                <div class="eh-nav-icon">${item.icon}</div>
                <div>
                  <span class="eh-nav-text">${item.label}</span>
                  <span class="eh-nav-note">${item.note}</span>
                </div>
              </div>
              <div class="eh-nav-index">${String(i + 1).padStart(2, '0')}</div>
            </button>
          `).join('')}
        </aside>

        <main class="eh-main">
          <section class="eh-hero">
            <div class="eh-hero-head">
              <div>
                <span class="eh-eyebrow">Study Hall inspired structure • original implementation</span>
                <h2>${heroTitle(activeLabel)}</h2>
                <p>${heroCopy(activeLabel)}</p>
              </div>
              <div class="eh-profile-card">
                <h4>${state.profile.name}</h4>
                <div class="meta">${state.profile.email || 'No email set'}</div>
                <div class="meta" style="margin-top:10px;">Readiness ${readinessScore()}% • Streak ${state.streak}d • Sessions ${state.examHistory.length}</div>
              </div>
            </div>
            <div class="eh-kpis" id="eh-kpis"></div>
          </section>
          <section class="eh-hero-strip" style="margin-top:18px;">
            <div class="eh-hero-card">
              <h4>Weekly activity</h4>
              <div class="eh-calendar">${dailyCalendar().map((d) => `<div class="eh-day ${d.active ? 'active' : ''}"><div class="d">${d.label}</div><div class="dot"></div></div>`).join('')}</div>
            </div>
            <div class="eh-hero-card">
              <h4>Current mission</h4>
              <p>${missionList().map((m) => `• ${m.title}`).join('<br>')}</p>
            </div>
          </section>
          <section id="view" style="margin-top:18px;"></section>
        </main>
      </div>
    </div>

    <div class="eh-bottom-nav">
      <div class="grid">
        ${navItems.slice(0, 5).map((item) => `<button data-nav="${item.id}">${item.label}</button>`).join('')}
      </div>
    </div>
  `;
  renderKPIs();
}

function renderKPIs() {
  const last = state.examHistory[0];
  const average = sessionAverage();
  const av = domainAverages();
  const items = [
    { label: 'Readiness', value: `${readinessScore()}%`, sub: 'Composite score' },
    { label: 'Average', value: `${average || 0}%`, sub: 'Session average' },
    { label: 'Saved', value: String(state.savedQuestions.length), sub: 'Review queue' },
    { label: 'Last score', value: last ? `${last.score}%` : '—', sub: 'Most recent exam' },
  ];
  const host = document.querySelector('#eh-kpis');
  if (!host) return;
  host.innerHTML = items.map((x) => `
    <div class="eh-kpi">
      <div class="label">${x.label}</div>
      <div class="value">${x.value}</div>
      <div class="sub">${x.sub}</div>
    </div>
  `).join('');
}

function heroTitle(label) {
  switch (label) {
    case 'Dashboard': return 'A premium command center for studying, tracking, and improving.';
    case 'Learning Plan': return 'A study plan that keeps your sessions focused and consistent.';
    case 'Practice': return 'Practice mode with split-screen review, notes, bookmarks, and confidence.';
    case 'Mock Exam': return 'A timed exam simulator with flags, confidence, and review mode.';
    case 'Analytics': return 'Deep analytics with radar charts, spark lines, and weak-domain insight.';
    case 'Sessions': return 'Session history, trend comparison, and export-ready records.';
    case 'Flashcards': return 'Fast recall cards designed for short, repeatable review loops.';
    case 'Profile': return 'A polished profile screen with achievements, plan, and sync state.';
    case 'Premium': return 'Bookmarks, custom collections, import/export, and premium controls.';
    case 'Settings': return 'Themes, shortcuts, accessibility, notifications, and data controls.';
    default: return 'Ultra-premium exam prep shell.';
  }
}

function heroCopy(label) {
  switch (label) {
    case 'Dashboard': return 'Use the dashboard for readiness, weekly activity, goals, and immediate next actions. The layout is optimized for fast decision-making.';
    case 'Learning Plan': return 'Each lesson is short, actionable, and easy to mark complete. The plan keeps the weak areas visible so your study time stays efficient.';
    case 'Practice': return 'The practice area supports answer selection, elimination mode, confidence scoring, bookmarks, and private notes for each item.';
    case 'Mock Exam': return 'The exam engine runs as a full-length timer-based simulator with navigation dots, flags, confidence tracking, and post-exam review.';
    case 'Analytics': return 'The analytics view combines trend lines, radar output, domain averages, and recommendations based on the latest sessions.';
    case 'Sessions': return 'Every mock exam is recorded locally. Compare the last attempts, export your data, or review the timeline of changes.';
    case 'Flashcards': return 'Use flashcards for short recall bursts and fast repetition. The deck is designed for quick memorization cycles.';
    case 'Profile': return 'The profile screen keeps your identity, goals, achievements, and membership status in one place.';
    case 'Premium': return 'The premium center handles search, bookmarks, notes, and import/export so your content workflow stays organized.';
    case 'Settings': return 'Tune the product feel: theme, sidebar, accessibility, notifications, offline mode, and local data reset.';
    default: return 'A single, polished shell for studying, testing, and tracking improvement.';
  }
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', note: 'Readiness and missions', icon: '⌂' },
  { id: 'plan', label: 'Learning Plan', note: 'Lessons and pacing', icon: '✓' },
  { id: 'practice', label: 'Practice', note: 'Question bank', icon: '?' },
  { id: 'exam', label: 'Mock Exam', note: 'Timed simulator', icon: '⏱' },
  { id: 'analytics', label: 'Analytics', note: 'Charts and trends', icon: '◌' },
  { id: 'sessions', label: 'Sessions', note: 'History and exports', icon: '≡' },
  { id: 'flashcards', label: 'Flashcards', note: 'Recall drilling', icon: '✦' },
  { id: 'profile', label: 'Profile', note: 'Identity and badges', icon: '☺' },
  { id: 'premium', label: 'Premium', note: 'Bookmarks and sync', icon: '◆' },
  { id: 'settings', label: 'Settings', note: 'Controls and privacy', icon: '⚙' },
];

function renderView() {
  const host = document.querySelector('#view');
  if (!host) return;
  if (state.tab === 'dashboard') host.innerHTML = renderDashboard();
  else if (state.tab === 'plan') host.innerHTML = renderPlan();
  else if (state.tab === 'practice') host.innerHTML = renderPractice();
  else if (state.tab === 'exam') host.innerHTML = renderExam();
  else if (state.tab === 'analytics') host.innerHTML = renderAnalytics();
  else if (state.tab === 'sessions') host.innerHTML = renderSessions();
  else if (state.tab === 'flashcards') host.innerHTML = renderFlashcards();
  else if (state.tab === 'profile') host.innerHTML = renderProfile();
  else if (state.tab === 'premium') host.innerHTML = renderPremium();
  else if (state.tab === 'settings') host.innerHTML = renderSettings();
  else host.innerHTML = renderDashboard();
}

function renderDashboard() {
  const av = domainAverages();
  const last = state.examHistory[0];
  const missions = missionList();
  const activity = state.activityLog.slice(0, 6);
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Performance overview</h3>
        <p class="eh-sub">Composite readiness, weekly progress, and domain focus.</p>
        <div class="eh-metrics">
          <div class="eh-metric"><div class="head"><div class="title">Readiness</div><div class="score">${readinessScore()}%</div></div><div class="eh-meter"><i style="width:${readinessScore()}%"></i></div></div>
          <div class="eh-metric"><div class="head"><div class="title">Average score</div><div class="score">${sessionAverage()}%</div></div><div class="eh-meter"><i style="width:${sessionAverage()}%"></i></div></div>
          <div class="eh-metric"><div class="head"><div class="title">Streak</div><div class="score">${state.streak}d</div></div><div class="eh-meter"><i style="width:${clamp(state.streak * 10, 0, 100)}%"></i></div></div>
          <div class="eh-metric"><div class="head"><div class="title">Last exam</div><div class="score">${last ? `${last.score}%` : '—'}</div></div><div class="eh-meter"><i style="width:${last ? last.score : 0}%"></i></div></div>
        </div>
        <div class="eh-hero-strip">
          <div class="eh-hero-card">
            <h4>Study recommendations</h4>
            <p>${missionList().map((m) => `• ${m.title}`).join('<br>')}</p>
          </div>
          <div class="eh-hero-card">
            <h4>Weak domain</h4>
            <p><strong>${weakestDomain()}</strong><br>People ${av.People}% • Process ${av.Process}% • Business ${av['Business Environment']}%</p>
          </div>
        </div>
        <div class="eh-row" style="margin-top:12px;">
          <button class="eh-btn primary" data-action="go-practice">Start practice</button>
          <button class="eh-btn ghost" data-action="go-exam">Launch exam</button>
          <button class="eh-btn ghost" data-action="go-analytics">View analytics</button>
          <button class="eh-btn ghost" data-action="open-command">Search actions</button>
        </div>
      </div>
      <div class="eh-panel">
        <h3>Weekly activity</h3>
        <p class="eh-sub">Green dots indicate active study days.</p>
        <div class="eh-calendar">${dailyCalendar().map((d) => `<div class="eh-day ${d.active ? 'active' : ''}"><div class="d">${d.label}</div><div class="dot"></div></div>`).join('')}</div>
        <div class="eh-divider" style="height:1px;background:var(--line);margin:14px 0;"></div>
        <h3>Recent activity</h3>
        <div class="eh-timeline">${activity.length ? activity.map((a) => `<div class="eh-timeline-item"><div class="eh-meta">${fmtDate(a.date)}</div><div style="margin-top:4px;font-weight:700;">${a.label}</div></div>`).join('') : `<div class="eh-timeline-item"><div class="eh-meta">No activity yet</div><div style="margin-top:4px;">Complete a lesson, save a question, or start an exam.</div></div>`}</div>
      </div>
    </div>
  `;
}

function renderPlan() {
  return `
    <div class="eh-panel">
      <h3>Learning plan</h3>
      <p class="eh-sub">Short lessons, clear pacing, and one-click completion.</p>
      <div class="eh-list">
        ${lessons.map((lesson) => {
          const done = state.completedLessons.includes(lesson.id);
          return `
            <div class="eh-item">
              <div class="eh-item-top">
                <div>
                  <b>${lesson.title}</b>
                  <div class="eh-meta">${lesson.domain} • ${lesson.minutes} minutes</div>
                </div>
                <div class="eh-badge">${done ? 'Done' : 'Open'}</div>
              </div>
              <p class="eh-text">${lesson.detail}</p>
              <div class="eh-row" style="margin-top:10px;">
                <button class="eh-btn ${done ? 'ghost' : 'primary'}" data-action="lesson-toggle" data-id="${lesson.id}">${done ? 'Mark open' : 'Mark complete'}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderPractice() {
  const q = currentQuestion();
  const selected = state.practiceChoice;
  const bookmarked = state.bookmarks.includes(q.id);
  const note = state.notes[q.id] || '';
  return `
    <div class="eh-split">
      <div class="eh-panel">
        <h3>Practice mode</h3>
        <p class="eh-sub">Answer, eliminate, bookmark, and attach a private note.</p>
        <div class="eh-item">
          <div class="eh-item-top">
            <div><b>Question ${state.currentPractice + 1} of ${practiceQuestions.length}</b><div class="eh-meta">${q.domain} • ${q.difficulty}</div></div>
            <div class="eh-badge">${q.domain}</div>
          </div>
          <p class="eh-text">${q.stem}</p>
          <div class="eh-options">
            ${q.options.map((opt, i) => {
              const cls = selected === null ? 'eh-option' : i === q.answer ? 'eh-option correct' : i === selected ? 'eh-option wrong' : 'eh-option';
              return `<button class="${cls}" data-action="practice-answer" data-id="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`;
            }).join('')}
          </div>
          ${selected !== null ? `<div class="eh-item" style="margin-top:12px;border-color:#2f516b;background:rgba(141,210,255,.08);"><div class="eh-meta">Rationale</div><div style="margin-top:6px;">${q.rationale}</div></div>` : ''}
        </div>
        <div class="eh-row" style="margin-top:12px;">
          <button class="eh-btn ghost" data-action="prev-practice">Previous</button>
          <button class="eh-btn ghost" data-action="next-practice">Next</button>
          <button class="eh-btn ${bookmarked ? '' : 'ghost'}" data-action="bookmark-practice">${bookmarked ? 'Bookmarked' : 'Bookmark'}</button>
          <button class="eh-btn primary" data-action="save-practice">Save question</button>
        </div>
      </div>
      <div class="eh-panel eh-stick">
        <h3>Review panel</h3>
        <p class="eh-sub">Use notes and confidence to structure the review.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Confidence</div><div class="eh-row" style="margin-top:8px;">${[1,2,3,4,5].map((n) => `<button class="eh-btn ${state.practiceConfidence === n ? 'primary' : 'ghost'}" data-action="practice-confidence" data-id="${n}">${n}</button>`).join('')}</div></div>
          <div class="eh-item"><div class="eh-meta">Private note</div><textarea class="eh-field" style="min-height:130px;margin-top:8px;resize:vertical;" data-action="practice-note" placeholder="Add a private note...">${note}</textarea></div>
          <div class="eh-item"><div class="eh-meta">Study queue</div><div class="eh-chipline" style="margin-top:10px;"><span class="chip2">Saved ${state.savedQuestions.length}</span><span class="chip2">Bookmarks ${state.bookmarks.length}</span><span class="chip2">Weak ${weakestDomain()}</span></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderExam() {
  if (state.reviewMode) {
    const last = state.examHistory[0];
    const pool = last?.pool || [];
    const q = pool[state.reviewIndex] || pool[0];
    const picked = last?.answers?.[state.reviewIndex];
    return `
      <div class="eh-panel">
        <h3>Review mode</h3>
        <p class="eh-sub">Walk through the last exam, question by question.</p>
        <div class="eh-item">
          <div class="eh-item-top"><div><b>Exam result: ${last.score}%</b><div class="eh-meta">${fmtDate(last.date)}</div></div><div class="eh-badge">${picked === q.answer ? 'Correct' : 'Missed'}</div></div>
          <p class="eh-text"><strong>${state.reviewIndex + 1}. ${q.stem}</strong></p>
          <div class="eh-options">${q.options.map((opt, i) => `<button class="${i === q.answer ? 'eh-option correct' : picked === i ? 'eh-option wrong' : 'eh-option'}" disabled>${String.fromCharCode(65 + i)}. ${opt}</button>`).join('')}</div>
          <div class="eh-item" style="margin-top:12px;border-color:#2f516b;background:rgba(141,210,255,.08);"><div class="eh-meta">Rationale</div><div style="margin-top:6px;">${q.rationale}</div></div>
        </div>
        <div class="eh-row" style="margin-top:12px;">
          <button class="eh-btn ghost" data-action="review-prev">Previous</button>
          <button class="eh-btn ghost" data-action="review-next">Next</button>
          <button class="eh-btn primary" data-action="exit-review">Exit review</button>
        </div>
      </div>
    `;
  }

  ensureExamPool();
  const q = state.examPool[state.examIndex];
  const picked = state.examAnswers[state.examIndex];
  const confidence = state.examConfidence[state.examIndex] || 3;
  const flagged = !!state.examFlags[state.examIndex];
  const answered = Object.keys(state.examAnswers).length;
  const progress = pct(answered, state.examPool.length);
  return `
    <div class="eh-panel">
      <div class="eh-row" style="justify-content:space-between;align-items:center;">
        <div>
          <h3 style="margin:0;">Mock exam</h3>
          <div class="eh-meta">${answered}/${state.examPool.length} answered • ${progress}% complete</div>
        </div>
        <div class="eh-chip" id="eh-exam-timer">${formatTimer(state.examSeconds)}</div>
      </div>
      <div class="eh-fullbar" style="margin-top:12px;"><i style="width:${progress}%"></i></div>
      <div class="eh-row" style="gap:8px; flex-wrap:wrap; margin-top:12px;">
        ${state.examPool.map((_, i) => `<button class="eh-btn ${i === state.examIndex ? 'primary' : state.examAnswers[i] !== undefined ? 'ghost' : ''}" data-action="exam-go" data-id="${i}">${i + 1}</button>`).join('')}
      </div>
      <div class="eh-split" style="margin-top:12px;">
        <div class="eh-item">
          <div class="eh-item-top"><div><b>Question ${state.examIndex + 1}</b><div class="eh-meta">${q.domain} • ${q.difficulty}</div></div><div class="eh-badge">${q.domain}</div></div>
          <p class="eh-text">${q.stem}</p>
          <div class="eh-options">${q.options.map((opt, i) => `<button class="${picked === i ? 'eh-option correct' : 'eh-option'}" data-action="exam-answer" data-id="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`).join('')}</div>
        </div>
        <div class="eh-item eh-stick">
          <div class="eh-meta">Controls</div>
          <div class="eh-row" style="margin-top:8px;">
            <button class="eh-btn ghost" data-action="exam-flag">${flagged ? 'Unflag' : 'Flag'}</button>
            <button class="eh-btn ghost" data-action="exam-prev">Previous</button>
            <button class="eh-btn ghost" data-action="exam-next">Next</button>
            <button class="eh-btn primary" data-action="submit-exam">Submit</button>
          </div>
          <div class="eh-divider" style="height:1px;background:var(--line);margin:12px 0;"></div>
          <div class="eh-meta">Confidence</div>
          <div class="eh-row" style="margin-top:8px;">${[1,2,3,4,5].map((n) => `<button class="eh-btn ${confidence === n ? 'primary' : 'ghost'}" data-action="exam-confidence" data-id="${n}">${n}</button>`).join('')}</div>
          <div class="eh-divider" style="height:1px;background:var(--line);margin:12px 0;"></div>
          <div class="eh-meta">Review queue</div>
          <div class="eh-chipline" style="margin-top:8px;"><span class="chip2">Bookmarked ${state.bookmarks.length}</span><span class="chip2">Weak ${weakestDomain()}</span><span class="chip2">Goal ${state.goal}%</span></div>
        </div>
      </div>
    </div>
  `;
}

function renderAnalytics() {
  const av = domainAverages();
  const spark = buildSpark(state.examHistory.slice().reverse().map((x) => x.score));
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Analytics</h3>
        <p class="eh-sub">Trend, radar, and domain-level averages.</p>
        <div class="eh-item">
          <div class="eh-meta">Score trend</div>
          <div style="margin-top:10px;">${spark}</div>
        </div>
        <div class="eh-hero-strip">
          <div class="eh-hero-card"><h4>Prediction</h4><p>Projected next score: <strong>${clamp(sessionAverage() + 4, 0, 100)}%</strong></p></div>
          <div class="eh-hero-card"><h4>Time pressure</h4><p>Average exam pace: <strong>${state.examHistory.length ? Math.max(30, Math.round(75 / state.examHistory[0].total)) : '—'} min/q</strong></p></div>
        </div>
        <div class="eh-list" style="margin-top:12px;">
          ${Object.entries(av).map(([domain, score]) => `
            <div class="eh-item">
              <div class="eh-item-top"><div><b>${domain}</b><div class="eh-meta">Average by session</div></div><div class="eh-badge">${score}%</div></div>
              <div class="eh-fullbar" style="margin-top:10px;"><i style="width:${score}%"></i></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="eh-panel">
        <h3>Radar view</h3>
        <p class="eh-sub">Balanced view of People, Process, and Business Environment.</p>
        ${buildRadar()}
        <div class="eh-list" style="margin-top:12px;">
          <div class="eh-item"><div class="eh-meta">Recommended focus</div><div style="margin-top:6px;font-weight:800;">${weakestDomain()}</div></div>
          <div class="eh-item"><div class="eh-meta">Daily target</div><div style="margin-top:6px;font-weight:800;">${state.goal}%</div></div>
        </div>
      </div>
    </div>
  `;
}

function renderSessions() {
  const history = state.examHistory;
  const trend = buildSpark(history.slice().reverse().map((x) => x.score), 580, 160);
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Session history</h3>
        <p class="eh-sub">Review the full run list, then export or import your study data.</p>
        <div class="eh-item">${trend}</div>
        <div class="eh-list" style="margin-top:12px;">
          ${history.length ? history.map((s, i) => `
            <div class="eh-item">
              <div class="eh-item-top"><div><b>Session ${i + 1}</b><div class="eh-meta">${fmtDate(s.date)}</div></div><div class="eh-badge">${s.score}%</div></div>
              <div class="eh-hero-strip" style="margin-top:10px;">
                ${domains.map((d) => `<div class="eh-hero-card"><h4>${d}</h4><p>${s.domainScores?.[d] ?? 0}%</p></div>`).join('')}
              </div>
            </div>
          `).join('') : `<div class="eh-item"><div class="eh-meta">No sessions stored yet.</div></div>`}
        </div>
      </div>
      <div class="eh-panel">
        <h3>Export & backup</h3>
        <p class="eh-sub">Backup your local data or restore it from a JSON file.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Cloud sync</div><div style="margin-top:6px;font-weight:800;">${state.cloudSync ? 'Connected' : 'Local backup ready'}</div></div>
          <div class="eh-item"><div class="eh-meta">Offline mode</div><div style="margin-top:6px;font-weight:800;">${state.offlineMode ? 'Enabled' : 'Disabled'}</div></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button></div></div>
        </div>
        <div class="eh-divider" style="height:1px;background:var(--line);margin:12px 0;"></div>
        <div class="eh-small">Export includes lessons, bookmarks, notes, missions, exam history, and preferences.</div>
      </div>
    </div>
  `;
}

function renderFlashcards() {
  const card = currentFlashcard();
  const flipped = !!state.flashcardFlipped;
  return `
    <div class="eh-panel">
      <h3>Flashcards</h3>
      <p class="eh-sub">Short review loops for fast recall.</p>
      <div class="eh-item eh-stick" style="min-height:240px; perspective: 1200px;">
        <div style="position:relative; min-height: 240px; transform-style:preserve-3d; transition: transform .55s ease; ${flipped ? 'transform:rotateY(180deg);' : ''}">
          <div style="position:absolute; inset:0; backface-visibility:hidden; padding:18px; border:1px solid #233648; border-radius:24px; background: rgba(255,255,255,.03);">
            <div class="eh-item-top"><div><b>Front</b><div class="eh-meta">Card ${state.currentPractice % flashcards.length + 1} of ${flashcards.length}</div></div><div class="eh-badge">Recall</div></div>
            <h3 style="margin:16px 0 10px;">${card.front}</h3>
            <p class="eh-text">Tap flip to reveal the answer.</p>
          </div>
          <div style="position:absolute; inset:0; backface-visibility:hidden; padding:18px; border:1px solid #233648; border-radius:24px; background: rgba(255,255,255,.03); transform: rotateY(180deg);">
            <div class="eh-item-top"><div><b>Back</b><div class="eh-meta">Answer</div></div><div class="eh-badge">Study</div></div>
            <h3 style="margin:16px 0 10px;">${card.back}</h3>
          </div>
        </div>
      </div>
      <div class="eh-row" style="margin-top:14px;">
        <button class="eh-btn ghost" data-action="card-prev">Previous</button>
        <button class="eh-btn primary" data-action="card-flip">Flip</button>
        <button class="eh-btn ghost" data-action="card-next">Next</button>
      </div>
    </div>
  `;
}

function renderProfile() {
  const achievements = [
    { x: '🏁', n: 'First session', d: 'Complete your first mock exam.' , ok: state.examHistory.length > 0 },
    { x: '🔥', n: 'Streak builder', d: 'Reach a 7 day streak.', ok: state.streak >= 7 },
    { x: '📚', n: 'Lesson finisher', d: 'Complete 3 lessons.', ok: state.completedLessons.length >= 3 },
    { x: '⭐', n: 'Saver', d: 'Bookmark 5 questions.', ok: state.bookmarks.length >= 5 },
    { x: '🎯', n: 'Goal hit', d: 'Hit your target score.', ok: state.examHistory.some((s) => s.score >= state.goal) },
    { x: '🧠', n: 'Reviewer', d: 'Save 10 questions.', ok: state.savedQuestions.length >= 10 },
  ];
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Profile</h3>
        <p class="eh-sub">Your identity, achievements, and session summary.</p>
        <div class="eh-item">
          <div class="eh-item-top"><div><b>${state.profile.name}</b><div class="eh-meta">${state.profile.email}</div></div><div class="eh-badge">${auth.unlocked ? 'Unlocked' : 'Locked'}</div></div>
          <div class="eh-chipline" style="margin-top:10px;"><span class="chip2">Readiness ${readinessScore()}%</span><span class="chip2">Streak ${state.streak}d</span><span class="chip2">Sessions ${state.examHistory.length}</span></div>
        </div>
        <div class="eh-item" style="margin-top:12px;"><div class="eh-meta">Membership</div><div style="margin-top:6px;font-weight:800;">Ultra Premium Trial</div><div class="eh-small" style="margin-top:4px;">Local plan preview, export, analytics, and command tools enabled.</div></div>
        <div class="eh-item" style="margin-top:12px;"><div class="eh-meta">Plan status</div><div style="margin-top:6px;font-weight:800;">Trial ready • Cloud sync simulated locally</div></div>
      </div>
      <div class="eh-panel">
        <h3>Achievements</h3>
        <p class="eh-sub">Progress badges unlocked through study behavior.</p>
        <div class="eh-achievements">${achievements.map((a) => `<div class="eh-ach ${a.ok ? 'ok' : ''}"><div class="x">${a.x}</div><div class="n">${a.n}</div><div class="d">${a.d}</div></div>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderPremium() {
  const pool = practiceQuestions.filter((q) => {
    const query = state.premiumSearch.toLowerCase();
    const matchesQuery = !query || `${q.stem} ${q.domain} ${q.difficulty}`.toLowerCase().includes(query);
    const matchesDomain = state.premiumFilterDomain === 'All' || q.domain === state.premiumFilterDomain;
    const matchesDiff = state.premiumFilterDifficulty === 'All' || q.difficulty === state.premiumFilterDifficulty;
    const matchesBookmarks = !state.premiumBookmarksOnly || state.bookmarks.includes(q.id);
    return matchesQuery && matchesDomain && matchesDiff && matchesBookmarks;
  });
  return `
    <div class="eh-modal open" style="position:static; display:block; background:transparent; backdrop-filter:none;">
      <div class="eh-modal-shell">
        <div class="eh-modal-head">
          <div>
            <h3 style="margin:0;">Premium Center</h3>
            <div class="eh-meta">Search, bookmarks, notes, and local backup</div>
          </div>
          <div class="eh-row"><button class="eh-btn ghost" data-action="premium-close">Close</button></div>
        </div>
        <div class="eh-modal-body">
          <div class="eh-tabs">
            ${['overview','bank','sync','export'].map((t) => `<button class="eh-tab ${state.premiumTab === t ? 'active' : ''}" data-action="premium-tab" data-id="${t}">${t}</button>`).join('')}
          </div>
          <div style="margin-top:12px;">
            ${renderPremiumTab(pool)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPremiumTab(pool) {
  const tab = state.premiumTab || 'overview';
  if (tab === 'bank') {
    return `
      <div class="eh-panel">
        <h3>Question bank</h3>
        <input class="eh-field" placeholder="Search questions" value="${state.premiumSearch || ''}" data-action="premium-search" />
        <div class="eh-row" style="margin-top:10px;">${['All', ...domains].map((d) => `<button class="eh-btn ${state.premiumFilterDomain === d ? 'primary' : 'ghost'}" data-action="premium-domain" data-id="${d}">${d}</button>`).join('')} ${['All','Easy','Medium','Hard'].map((d) => `<button class="eh-btn ${state.premiumFilterDifficulty === d ? 'primary' : 'ghost'}" data-action="premium-difficulty" data-id="${d}">${d}</button>`).join('')} <button class="eh-btn ghost" data-action="premium-bookmarks">${state.premiumBookmarksOnly ? 'Bookmarks only' : 'Show bookmarks only'}</button></div>
        <div class="eh-list" style="margin-top:12px;">${pool.map((q) => `<div class="eh-item"><div class="eh-item-top"><div><b>Question ${q.id}</b><div class="eh-meta">${q.domain} • ${q.difficulty}</div></div><button class="eh-btn ${state.bookmarks.includes(q.id) ? 'primary' : 'ghost'}" data-action="premium-bookmark" data-id="${q.id}">${state.bookmarks.includes(q.id) ? 'Bookmarked' : 'Bookmark'}</button></div><p class="eh-text">${q.stem}</p><textarea class="eh-field" style="min-height:78px;margin-top:10px;resize:vertical;" data-action="premium-note" data-id="${q.id}" placeholder="Private note...">${state.notes[q.id] || ''}</textarea></div>`).join('')}</div>
      </div>
    `;
  }
  if (tab === 'sync') {
    return `
      <div class="eh-panel">
        <h3>Sync</h3>
        <p class="eh-sub">Local backup is ready. Cloud sync is represented here as a local state toggle.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Cloud sync</div><div style="margin-top:6px;font-weight:800;">${state.cloudSync ? 'Connected' : 'Disconnected'}</div></div>
          <div class="eh-item"><div class="eh-meta">Offline mode</div><div style="margin-top:6px;font-weight:800;">${state.offlineMode ? 'Enabled' : 'Disabled'}</div></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="sync-toggle">Toggle cloud sync</button><button class="eh-btn ghost" data-action="offline-toggle">Toggle offline mode</button></div></div>
        </div>
      </div>
    `;
  }
  if (tab === 'export') {
    return `
      <div class="eh-panel">
        <h3>Import / export</h3>
        <p class="eh-sub">Download or restore your local study package as JSON.</p>
        <div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button><button class="eh-btn ghost" data-action="premium-reset">Reset premium data</button></div>
      </div>
    `;
  }
  return `
    <div class="eh-panel">
      <h3>Overview</h3>
      <p class="eh-sub">Bookmarks, quick actions, and data utilities.</p>
      <div class="eh-hero-strip">
        <div class="eh-hero-card"><h4>Bookmarks</h4><p>${state.bookmarks.length} items</p></div>
        <div class="eh-hero-card"><h4>Notes</h4><p>${Object.keys(state.notes).length} note threads</p></div>
      </div>
      <div class="eh-row" style="margin-top:12px;"><button class="eh-btn primary" data-action="premium-tab" data-id="bank">Open bank</button><button class="eh-btn ghost" data-action="premium-tab" data-id="sync">Sync</button><button class="eh-btn ghost" data-action="premium-tab" data-id="export">Export</button></div>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Settings</h3>
        <p class="eh-sub">Theme, layout, notifications, and data controls.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Theme</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${prefs.theme === 'dark' ? 'primary' : 'ghost'}" data-action="set-theme" data-id="dark">Dark</button><button class="eh-btn ${prefs.theme === 'light' ? 'primary' : 'ghost'}" data-action="set-theme" data-id="light">Light</button></div></div>
          <div class="eh-item"><div class="eh-meta">Sidebar</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ghost" data-action="toggle-sidebar">${prefs.sidebarCollapsed ? 'Expand' : 'Collapse'}</button></div></div>
          <div class="eh-item"><div class="eh-meta">Notifications</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${state.notifications ? 'primary' : 'ghost'}" data-action="toggle-notifications">${state.notifications ? 'On' : 'Off'}</button></div></div>
          <div class="eh-item"><div class="eh-meta">Offline mode</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${state.offlineMode ? 'primary' : 'ghost'}" data-action="toggle-offline">${state.offlineMode ? 'Enabled' : 'Disabled'}</button></div></div>
        </div>
      </div>
      <div class="eh-panel">
        <h3>Data and access</h3>
        <p class="eh-sub">Goal, identity, access code, and reset.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Goal score</div><input class="eh-field" type="range" min="50" max="100" value="${state.goal}" data-action="goal-range" /></div>
          <div class="eh-item"><div class="eh-meta">Profile name</div><input class="eh-field" value="${state.profile.name}" data-action="profile-name" placeholder="Your name" /></div>
          <div class="eh-item"><div class="eh-meta">Email</div><input class="eh-field" value="${state.profile.email}" data-action="profile-email" placeholder="Email" /></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button><button class="eh-btn ghost" data-action="reset-all">Reset all</button></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderSessions() {
  const history = state.examHistory;
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Session history</h3>
        <p class="eh-sub">Trend and detailed session list.</p>
        <div class="eh-item">${buildSpark(history.slice().reverse().map((x) => x.score), 620, 180)}</div>
        <div class="eh-list" style="margin-top:12px;">${history.length ? history.map((s, i) => `<div class="eh-item"><div class="eh-item-top"><div><b>Session ${i + 1}</b><div class="eh-meta">${fmtDate(s.date)}</div></div><div class="eh-badge">${s.score}%</div></div><div class="eh-hero-strip" style="margin-top:10px;">${domains.map((d) => `<div class="eh-hero-card"><h4>${d}</h4><p>${s.domainScores?.[d] ?? 0}%</p></div>`).join('')}</div></div>`).join('') : `<div class="eh-item"><div class="eh-meta">No sessions yet.</div></div>`}</div>
      </div>
      <div class="eh-panel">
        <h3>Export</h3>
        <p class="eh-sub">Download your progress or restore it later.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Readiness</div><div style="margin-top:6px;font-weight:800;">${readinessScore()}%</div></div>
          <div class="eh-item"><div class="eh-meta">Average</div><div style="margin-top:6px;font-weight:800;">${sessionAverage()}%</div></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderAnalytics() {
  const av = domainAverages();
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Analytics</h3>
        <p class="eh-sub">Radar, prediction, and score trend.</p>
        <div class="eh-item">${buildSpark(state.examHistory.slice().reverse().map((x) => x.score))}</div>
        <div class="eh-hero-strip" style="margin-top:12px;">
          <div class="eh-hero-card"><h4>Projection</h4><p>${clamp(sessionAverage() + 4, 0, 100)}% next target</p></div>
          <div class="eh-hero-card"><h4>Focus</h4><p>${weakestDomain()}</p></div>
        </div>
      </div>
      <div class="eh-panel">
        <h3>Domain radar</h3>
        <p class="eh-sub">Balanced view of three domains.</p>
        ${buildRadar()}
        <div class="eh-list" style="margin-top:12px;">${Object.entries(av).map(([k, v]) => `<div class="eh-item"><div class="eh-item-top"><div><b>${k}</b><div class="eh-meta">Average by session</div></div><div class="eh-badge">${v}%</div></div><div class="eh-fullbar" style="margin-top:10px;"><i style="width:${v}%"></i></div></div>`).join('')}</div>
      </div>
    </div>
  `;
}

function renderPremium() { return renderPremiumModal(); }

function renderPremiumModal() {
  const tab = state.premiumTab || 'overview';
  const filtered = practiceQuestions.filter((q) => {
    const query = (state.premiumSearch || '').toLowerCase();
    const text = `${q.stem} ${q.domain} ${q.difficulty}`.toLowerCase();
    return (!query || text.includes(query)) && (state.premiumFilterDomain === 'All' || q.domain === state.premiumFilterDomain) && (state.premiumFilterDifficulty === 'All' || q.difficulty === state.premiumFilterDifficulty) && (!state.premiumBookmarksOnly || state.bookmarks.includes(q.id));
  });
  const body = tab === 'bank' ? `
      <div class="eh-panel">
        <h3>Question bank</h3>
        <input class="eh-field" placeholder="Search questions..." value="${state.premiumSearch || ''}" data-action="premium-search" />
        <div class="eh-row" style="margin-top:10px;">${['All', ...domains].map((d) => `<button class="eh-btn ${state.premiumFilterDomain === d ? 'primary' : 'ghost'}" data-action="premium-domain" data-id="${d}">${d}</button>`).join('')} ${['All','Easy','Medium','Hard'].map((d) => `<button class="eh-btn ${state.premiumFilterDifficulty === d ? 'primary' : 'ghost'}" data-action="premium-diff" data-id="${d}">${d}</button>`).join('')} <button class="eh-btn ghost" data-action="premium-bookmarks">${state.premiumBookmarksOnly ? 'Bookmarks only' : 'Show bookmarks only'}</button></div>
        <div class="eh-list" style="margin-top:12px;">${filtered.map((q) => `<div class="eh-item"><div class="eh-item-top"><div><b>Question ${q.id}</b><div class="eh-meta">${q.domain} • ${q.difficulty}</div></div><button class="eh-btn ${state.bookmarks.includes(q.id) ? 'primary' : 'ghost'}" data-action="premium-bookmark" data-id="${q.id}">${state.bookmarks.includes(q.id) ? 'Bookmarked' : 'Bookmark'}</button></div><p class="eh-text">${q.stem}</p><textarea class="eh-field" style="min-height:78px; margin-top:10px; resize:vertical;" data-action="premium-note" data-id="${q.id}" placeholder="Private note...">${state.notes[q.id] || ''}</textarea></div>`).join('')}</div>
      </div>
  ` : tab === 'sync' ? `
      <div class="eh-panel">
        <h3>Sync</h3>
        <p class="eh-sub">Local backup and simulated cloud sync status.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Cloud sync</div><div style="margin-top:6px;font-weight:800;">${state.cloudSync ? 'Connected' : 'Disconnected'}</div></div>
          <div class="eh-item"><div class="eh-meta">Offline mode</div><div style="margin-top:6px;font-weight:800;">${state.offlineMode ? 'Enabled' : 'Disabled'}</div></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="sync-toggle">Toggle cloud sync</button><button class="eh-btn ghost" data-action="offline-toggle">Toggle offline mode</button></div></div>
        </div>
      </div>
  ` : tab === 'export' ? `
      <div class="eh-panel">
        <h3>Import / export</h3>
        <p class="eh-sub">Download or restore your local study package as JSON.</p>
        <div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button><button class="eh-btn ghost" data-action="premium-reset">Reset premium data</button></div>
      </div>
  ` : `
      <div class="eh-panel">
        <h3>Overview</h3>
        <p class="eh-sub">Bookmarks, quick actions, and data utilities.</p>
        <div class="eh-hero-strip">
          <div class="eh-hero-card"><h4>Bookmarks</h4><p>${state.bookmarks.length} items</p></div>
          <div class="eh-hero-card"><h4>Notes</h4><p>${Object.keys(state.notes).length} note threads</p></div>
        </div>
        <div class="eh-row" style="margin-top:12px;"><button class="eh-btn primary" data-action="premium-tab" data-id="bank">Open bank</button><button class="eh-btn ghost" data-action="premium-tab" data-id="sync">Sync</button><button class="eh-btn ghost" data-action="premium-tab" data-id="export">Export</button></div>
      </div>
  `;
  return `
    <div class="eh-modal open" style="position:static; display:block; background:transparent; backdrop-filter:none;">
      <div class="eh-modal-shell">
        <div class="eh-modal-head">
          <div><h3 style="margin:0;">Premium Center</h3><div class="eh-meta">Search, bookmarks, notes, and local backup</div></div>
          <div class="eh-row"><button class="eh-btn ghost" data-action="premium-close">Close</button></div>
        </div>
        <div class="eh-modal-body">
          <div class="eh-tabs">${['overview','bank','sync','export'].map((t) => `<button class="eh-tab ${tab === t ? 'active' : ''}" data-action="premium-tab" data-id="${t}">${t}</button>`).join('')}</div>
          <div style="margin-top:12px;">${body}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="eh-grid-2">
      <div class="eh-panel">
        <h3>Settings</h3>
        <p class="eh-sub">Theme, sidebar, notifications, and offline mode.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Theme</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${prefs.theme === 'dark' ? 'primary' : 'ghost'}" data-action="set-theme" data-id="dark">Dark</button><button class="eh-btn ${prefs.theme === 'light' ? 'primary' : 'ghost'}" data-action="set-theme" data-id="light">Light</button></div></div>
          <div class="eh-item"><div class="eh-meta">Sidebar</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ghost" data-action="toggle-sidebar">${prefs.sidebarCollapsed ? 'Expand' : 'Collapse'}</button></div></div>
          <div class="eh-item"><div class="eh-meta">Notifications</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${state.notifications ? 'primary' : 'ghost'}" data-action="toggle-notifications">${state.notifications ? 'On' : 'Off'}</button></div></div>
          <div class="eh-item"><div class="eh-meta">Offline mode</div><div class="eh-row" style="margin-top:8px;"><button class="eh-btn ${state.offlineMode ? 'primary' : 'ghost'}" data-action="toggle-offline">${state.offlineMode ? 'Enabled' : 'Disabled'}</button></div></div>
        </div>
      </div>
      <div class="eh-panel">
        <h3>Identity and data</h3>
        <p class="eh-sub">Name, email, goal, and access reset.</p>
        <div class="eh-list">
          <div class="eh-item"><div class="eh-meta">Profile name</div><input class="eh-field" value="${state.profile.name}" data-action="profile-name" /></div>
          <div class="eh-item"><div class="eh-meta">Email</div><input class="eh-field" value="${state.profile.email}" data-action="profile-email" /></div>
          <div class="eh-item"><div class="eh-meta">Goal score: ${state.goal}%</div><input class="eh-field" type="range" min="50" max="100" value="${state.goal}" data-action="goal-range" /></div>
          <div class="eh-item"><div class="eh-row"><button class="eh-btn primary" data-action="export-json">Export JSON</button><button class="eh-btn ghost" data-action="import-json">Import JSON</button><button class="eh-btn ghost" data-action="reset-all">Reset all</button></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderAuth() {
  return `
    <div class="eh-auth ${auth.unlocked ? '' : 'open'}" id="eh-auth">
      <div class="eh-auth-shell">
        <div class="eh-auth-hero">
          <span class="eh-eyebrow">Secure local access</span>
          <h2>Exam Hall Login</h2>
          <p>Use a local access gate for testing. Demo code: <strong>2025</strong>.</p>
        </div>
        <div class="eh-auth-body">
          <input class="eh-field" placeholder="Your name" id="eh-auth-name" />
          <input class="eh-field" placeholder="Email address" id="eh-auth-email" />
          <input class="eh-field" placeholder="Access code" id="eh-auth-code" inputmode="numeric" />
          <div class="eh-auth-row">
            <button class="eh-btn primary" data-action="auth-unlock">Unlock</button>
            <button class="eh-btn ghost" data-action="auth-demo">Demo access</button>
            <button class="eh-btn ghost" data-action="auth-reset">Clear session</button>
          </div>
          <div class="eh-small">This gate is local only and exists for testing and demos.</div>
        </div>
      </div>
    </div>
  `;
}

function renderCommand() {
  const actions = commandActions().filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(commandQuery.toLowerCase()));
  return `
    <div class="eh-command ${commandOpen ? 'open' : ''}" id="eh-command">
      <div class="eh-command-shell">
        <div class="eh-command-head"><input class="eh-field" id="eh-command-input" placeholder="Search actions, tabs, or tools..." value="${commandQuery}" /></div>
        <div class="eh-command-list">
          ${actions.length ? actions.map((a, i) => `<button class="eh-command-item ${i === commandIndex ? 'active' : ''}" data-action="cmd-run" data-id="${i}"><div><strong>${a.label}</strong><span>${a.hint}</span></div><span>↵</span></button>`).join('') : `<div class="eh-small" style="padding:12px;">No actions found.</div>`}
        </div>
      </div>
    </div>
  `;
}

function commandActions() {
  return [
    { label: 'Go to Dashboard', hint: 'Open the overview', run: () => setTab('dashboard') },
    { label: 'Open Learning Plan', hint: 'Lessons and pacing', run: () => setTab('plan') },
    { label: 'Start Practice', hint: 'Question bank drill', run: () => setTab('practice') },
    { label: 'Launch Mock Exam', hint: 'Timed simulator', run: () => setTab('exam') },
    { label: 'Open Analytics', hint: 'Radar and trend', run: () => setTab('analytics') },
    { label: 'Open Sessions', hint: 'History and exports', run: () => setTab('sessions') },
    { label: 'Open Flashcards', hint: 'Recall drilling', run: () => setTab('flashcards') },
    { label: 'Open Profile', hint: 'Badges and trial', run: () => setTab('profile') },
    { label: 'Open Premium Center', hint: 'Bookmarks and sync', run: () => setTab('premium') },
    { label: 'Toggle Theme', hint: 'Dark / light', run: toggleTheme },
    { label: 'Toggle Sidebar', hint: 'Compact layout', run: toggleSidebar },
  ];
}

function openCommand() { commandOpen = true; commandQuery = ''; commandIndex = 0; render(); setTimeout(() => document.querySelector('#eh-command-input')?.focus(), 0); }
function closeCommand() { commandOpen = false; render(); }
function toggleTheme() { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; savePrefs(); applyPrefs(); toast('Theme updated', `Switched to ${prefs.theme} mode.`); }
function toggleSidebar() { prefs.sidebarCollapsed = !prefs.sidebarCollapsed; savePrefs(); applyPrefs(); toast('Layout updated', prefs.sidebarCollapsed ? 'Sidebar collapsed.' : 'Sidebar expanded.'); }

function setTab(tab) {
  state.tab = tab;
  saveState();
  render();
}

function exportJson() {
  const payload = { exportedAt: new Date().toISOString(), state, prefs, auth };
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
  if (payload.state) state = { ...structuredClone(defaultState), ...payload.state };
  if (payload.prefs) prefs = { ...structuredClone(defaultPrefs), ...payload.prefs };
  if (payload.auth) auth = { ...structuredClone(defaultAuth), ...payload.auth };
  saveState(); savePrefs(); saveAuth(); applyPrefs(); render();
}

function unlockDemo() {
  auth = { unlocked: true };
  if (!state.profile.name) state.profile.name = 'Demo User';
  if (!state.profile.email) state.profile.email = 'demo@exam.local';
  saveAuth();
  toast('Demo access', 'Local demo profile enabled.');
  render();
}

function unlockFromLogin() {
  const name = document.querySelector('#eh-auth-name')?.value.trim() || 'Learner';
  const email = document.querySelector('#eh-auth-email')?.value.trim() || '';
  const code = document.querySelector('#eh-auth-code')?.value.trim() || '';
  if (code !== '2025') { toast('Access denied', 'Invalid access code.'); return; }
  auth = { unlocked: true };
  state.profile.name = name;
  state.profile.email = email;
  saveAuth(); saveState();
  toast('Access granted', 'Session unlocked.');
  render();
}

function resetAuth() {
  auth = structuredClone(defaultAuth);
  saveAuth();
  render();
}

function startCommandRun(index) {
  const list = commandActions().filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(commandQuery.toLowerCase()));
  list[index]?.run();
  closeCommand();
}

function render() {
  if (!auth.unlocked) {
    app.innerHTML = renderAuth() + renderCommand();
    bindEvents();
    applyPrefs();
    return;
  }
  renderShell();
  renderView();
  app.insertAdjacentHTML('beforeend', renderCommand());
  bindEvents();
  applyPrefs();
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach((btn) => btn.addEventListener('click', () => setTab(btn.dataset.nav)));
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKeyDown);
}

function onClick(event) {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === 'theme') toggleTheme();
  if (action === 'sidebar') toggleSidebar();
  if (action === 'command' || action === 'open-command') openCommand();
  if (action === 'premium') setTab('premium');
  if (action === 'go-practice') setTab('practice');
  if (action === 'go-exam') setTab('exam');
  if (action === 'go-analytics') setTab('analytics');
  if (action === 'lesson-toggle') completeLesson(id);
  if (action === 'practice-answer') {
    state.practiceChoice = Number(id);
    logActivity(`Answered practice question ${currentQuestion().id}`);
    saveState(); render();
  }
  if (action === 'practice-confidence') { state.practiceConfidence = Number(id); saveState(); render(); }
  if (action === 'practice-note') { state.notes[currentQuestion().id] = event.target.value; saveState(); }
  if (action === 'save-practice') { toggleSaved(currentQuestion().id); toast('Saved', 'Question added to your review queue.'); }
  if (action === 'bookmark-practice') { toggleBookmark(currentQuestion().id); toast('Bookmark updated', 'Question bookmark toggled.'); }
  if (action === 'prev-practice') { state.currentPractice = (state.currentPractice - 1 + practiceQuestions.length) % practiceQuestions.length; state.practiceChoice = null; saveState(); render(); }
  if (action === 'next-practice') { state.currentPractice = (state.currentPractice + 1) % practiceQuestions.length; state.practiceChoice = null; saveState(); render(); }
  if (action === 'exam-answer') { state.examAnswers[state.examIndex] = Number(id); logActivity(`Answered exam question ${state.examIndex + 1}`); saveState(); render(); }
  if (action === 'exam-confidence') { state.examConfidence[state.examIndex] = Number(id); saveState(); render(); }
  if (action === 'exam-flag') { state.examFlags[state.examIndex] = !state.examFlags[state.examIndex]; saveState(); render(); }
  if (action === 'exam-prev') { state.examIndex = (state.examIndex - 1 + state.examPool.length) % state.examPool.length; saveState(); render(); }
  if (action === 'exam-next') { state.examIndex = (state.examIndex + 1) % state.examPool.length; saveState(); render(); }
  if (action === 'exam-go') { state.examIndex = Number(id); saveState(); render(); }
  if (action === 'submit-exam') finishExam();
  if (action === 'review-prev') { state.reviewIndex = (state.reviewIndex - 1 + (state.examHistory[0]?.pool?.length || 1)) % (state.examHistory[0]?.pool?.length || 1); saveState(); render(); }
  if (action === 'review-next') { state.reviewIndex = (state.reviewIndex + 1) % (state.examHistory[0]?.pool?.length || 1); saveState(); render(); }
  if (action === 'exit-review') { state.reviewMode = false; state.tab = 'sessions'; saveState(); render(); }
  if (action === 'card-flip') { state.flashcardFlipped = !state.flashcardFlipped; render(); }
  if (action === 'card-prev') { state.currentPractice = (state.currentPractice - 1 + flashcards.length) % flashcards.length; state.flashcardFlipped = false; render(); }
  if (action === 'card-next') { state.currentPractice = (state.currentPractice + 1) % flashcards.length; state.flashcardFlipped = false; render(); }
  if (action === 'premium-close') { setTab('dashboard'); }
  if (action === 'premium-tab') { state.premiumTab = id; saveState(); render(); }
  if (action === 'premium-search') { state.premiumSearch = event.target.value; saveState(); render(); }
  if (action === 'premium-domain') { state.premiumFilterDomain = id; saveState(); render(); }
  if (action === 'premium-diff') { state.premiumFilterDifficulty = id; saveState(); render(); }
  if (action === 'premium-bookmarks') { state.premiumBookmarksOnly = !state.premiumBookmarksOnly; saveState(); render(); }
  if (action === 'premium-bookmark') { toggleBookmark(Number(id)); }
  if (action === 'premium-note') { state.notes[id] = event.target.value; saveState(); }
  if (action === 'premium-reset') { if (confirm('Reset premium data only?')) { state.bookmarks = []; state.notes = {}; state.premiumSearch = ''; state.premiumFilterDomain = 'All'; state.premiumFilterDifficulty = 'All'; state.premiumBookmarksOnly = false; saveState(); render(); } }
  if (action === 'sync-toggle') { state.cloudSync = !state.cloudSync; saveState(); render(); toast('Sync updated', state.cloudSync ? 'Cloud sync connected.' : 'Cloud sync disconnected.'); }
  if (action === 'offline-toggle') { state.offlineMode = !state.offlineMode; saveState(); render(); toast('Offline mode', state.offlineMode ? 'Offline mode enabled.' : 'Offline mode disabled.'); }
  if (action === 'export-json') exportJson();
  if (action === 'import-json') document.querySelector('#eh-file')?.click();
  if (action === 'reset-all') { if (confirm('Reset all local data?')) { localStorage.removeItem(STORAGE.state); localStorage.removeItem(STORAGE.prefs); localStorage.removeItem(STORAGE.auth); state = structuredClone(defaultState); prefs = structuredClone(defaultPrefs); auth = structuredClone(defaultAuth); saveState(); savePrefs(); saveAuth(); render(); } }
  if (action === 'set-theme') { prefs.theme = id; savePrefs(); applyPrefs(); toast('Theme updated', `${id} mode enabled.`); }
  if (action === 'toggle-notifications') { state.notifications = !state.notifications; saveState(); render(); }
  if (action === 'toggle-offline') { state.offlineMode = !state.offlineMode; saveState(); render(); }
  if (action === 'goal-range') { state.goal = Number(event.target.value); saveState(); render(); }
  if (action === 'profile-name') { state.profile.name = event.target.value; saveState(); }
  if (action === 'profile-email') { state.profile.email = event.target.value; saveState(); }
  if (action === 'auth-unlock') unlockFromLogin();
  if (action === 'auth-demo') unlockDemo();
  if (action === 'auth-reset') resetAuth();
  if (action === 'cmd-run') startCommandRun(Number(id));
}

function onInput(event) {
  if (event.target.id === 'eh-command-input') {
    commandQuery = event.target.value;
    commandIndex = 0;
    updateCommand();
  }
}

function onKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
  if (event.key === 'Escape') { if (commandOpen) closeCommand(); }
  if (commandOpen && event.key === 'ArrowDown') { event.preventDefault(); commandIndex += 1; updateCommand(); }
  if (commandOpen && event.key === 'ArrowUp') { event.preventDefault(); commandIndex -= 1; updateCommand(); }
  if (commandOpen && event.key === 'Enter') { event.preventDefault(); startCommandRun(commandIndex); }
}

function updateCommand() {
  const list = commandActions().filter((a) => `${a.label} ${a.hint}`.toLowerCase().includes(commandQuery.toLowerCase()));
  if (list.length) commandIndex = ((commandIndex % list.length) + list.length) % list.length; else commandIndex = 0;
  const container = document.querySelector('#eh-command');
  if (!container) return;
  container.querySelector('.eh-command-list').innerHTML = list.length ? list.map((a, i) => `<button class="eh-command-item ${i === commandIndex ? 'active' : ''}" data-action="cmd-run" data-id="${i}"><div><strong>${a.label}</strong><span>${a.hint}</span></div><span>↵</span></button>`).join('') : `<div class="eh-small" style="padding:12px;">No actions found.</div>`;
  container.querySelector('#eh-command-input').value = commandQuery;
}

function openCommand() { commandOpen = true; commandQuery = ''; commandIndex = 0; render(); setTimeout(() => document.querySelector('#eh-command-input')?.focus(), 0); }
function closeCommand() { commandOpen = false; render(); }

function applyNotifications() {
  if (!state.notifications) return;
  if (state.examHistory.length && state.examHistory[0].score >= state.goal) {
    toast('Goal met', `Latest score ${state.examHistory[0].score}% reached your target.`);
  }
}

function boot() {
  applyPrefs();
  if (state.profile?.name && state.profile.name !== 'Learner') auth.unlocked = true;
  render();
  setTimeout(() => { if (!auth.unlocked) document.querySelector('#eh-auth-name')?.focus(); }, 50);
  setInterval(() => { if (auth.unlocked) renderKPIs(); }, 5000);
  setTimeout(applyNotifications, 800);
}

boot();
