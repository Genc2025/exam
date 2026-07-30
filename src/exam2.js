const EXAM_KEY = 'exam-hall-state-v4';
const QUESTION_COUNT = 10;
const EXAM_MINUTES = 90;
const styles = document.createElement('style');
styles.textContent = `
  .immersion-launcher {
    position: fixed;
    right: 18px;
    bottom: 150px;
    z-index: 95;
    border: 1px solid #35546d;
    background: linear-gradient(145deg, rgba(255,212,121,.16), rgba(141,210,255,.16));
    color: #eef4fb;
    border-radius: 999px;
    padding: 12px 16px;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    backdrop-filter: blur(12px);
    font-weight: 800;
  }
  .immersion-modal {
    position: fixed;
    inset: 0;
    z-index: 240;
    display: none;
    background: rgba(0,0,0,.72);
    backdrop-filter: blur(18px);
  }
  .immersion-modal.open { display: grid; place-items: center; }
  .immersion-shell {
    width: min(1400px, calc(100vw - 18px));
    height: min(96vh, 980px);
    border: 1px solid #35546d;
    border-radius: 30px;
    overflow: hidden;
    background: linear-gradient(180deg, #0b1826, #08111b);
    box-shadow: 0 30px 120px rgba(0,0,0,.6);
    display: grid;
    grid-template-rows: auto auto 1fr auto;
  }
  .immersion-top {
    display:flex;
    justify-content:space-between;
    gap:12px;
    align-items:center;
    padding: 16px 18px;
    border-bottom: 1px solid #203346;
    background: rgba(10,18,28,.94);
  }
  .immersion-top h2 { margin: 0; font-size: 18px; }
  .immersion-top p { margin: 4px 0 0; color: #95a8bd; font-size: 12px; }
  .immersion-toolbar {
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    padding: 12px 18px;
    border-bottom: 1px solid #203346;
    background: rgba(255,255,255,.02);
  }
  .immersion-layout {
    display:grid;
    grid-template-columns: 120px minmax(0, 1fr) 320px;
    gap: 12px;
    padding: 12px 18px 0;
    min-height: 0;
  }
  .immersion-nav,
  .immersion-side,
  .immersion-main {
    min-height: 0;
    overflow: auto;
  }
  .immersion-nav {
    display:grid;
    gap: 8px;
    align-content: start;
  }
  .immersion-qdot {
    width: 100%;
    min-height: 42px;
    border-radius: 14px;
    border: 1px solid #233648;
    background: rgba(255,255,255,.03);
    color: #eef4fb;
    font-size: 13px;
  }
  .immersion-qdot.active { background: rgba(141,210,255,.16); }
  .immersion-qdot.flagged { border-color: #ffd479; }
  .immersion-qdot.answered { border-color: #2f7d5a; }
  .immersion-main {
    border: 1px solid #233648;
    border-radius: 22px;
    background: rgba(255,255,255,.03);
    padding: 16px;
  }
  .immersion-main h3 { margin: 0 0 8px; font-size: 18px; }
  .immersion-main .meta { color: #95a8bd; font-size: 12px; }
  .immersion-main p { color: #dce7f2; line-height: 1.55; }
  .immersion-options { display:grid; gap:10px; margin-top: 12px; }
  .immersion-option {
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: 16px;
    border: 1px solid #2b4155;
    background: rgba(11,22,33,.95);
    color: #eef4fb;
  }
  .immersion-option.correct { border-color: #2f7d5a; background: rgba(121,255,168,.10); }
  .immersion-option.wrong { border-color: #8a4f4f; background: rgba(255,138,138,.08); }
  .immersion-side {
    display:grid;
    gap: 12px;
    align-content: start;
  }
  .immersion-box {
    padding: 14px;
    border: 1px solid #233648;
    border-radius: 18px;
    background: rgba(255,255,255,.03);
  }
  .immersion-box h4 { margin: 0 0 10px; font-size: 14px; }
  .immersion-timer {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -.04em;
    font-variant-numeric: tabular-nums;
  }
  .immersion-note {
    width: 100%;
    min-height: 120px;
    resize: vertical;
    border-radius: 14px;
    border: 1px solid #274053;
    background: #0c1723;
    color: #eef4fb;
    padding: 12px;
    outline: none;
  }
  .immersion-footer {
    display:flex;
    justify-content:space-between;
    gap:12px;
    align-items:center;
    padding: 14px 18px 18px;
    border-top: 1px solid #203346;
    background: rgba(10,18,28,.94);
  }
  .immersion-progress {
    flex: 1;
    height: 12px;
    border-radius: 999px;
    background: #102131;
    overflow: hidden;
    border: 1px solid #24394d;
  }
  .immersion-progress > i {
    display:block;
    height:100%;
    width:0;
    background: linear-gradient(90deg, #8dd2ff, #79ffa8);
  }
  .immersion-sub {
    color: #95a8bd;
    font-size: 12px;
    white-space: nowrap;
  }
  @media (max-width: 1180px) {
    .immersion-layout { grid-template-columns: 92px minmax(0, 1fr); }
    .immersion-side { grid-column: 1 / -1; grid-template-columns: repeat(2, minmax(0,1fr)); }
  }
  @media (max-width: 720px) {
    .immersion-shell { width: calc(100vw - 12px); height: calc(100vh - 12px); border-radius: 24px; }
    .immersion-layout { grid-template-columns: 1fr; }
    .immersion-nav { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .immersion-side { grid-template-columns: 1fr; }
    .immersion-top { align-items:flex-start; }
    .immersion-footer { flex-direction: column; align-items: stretch; }
  }
`;
document.head.appendChild(styles);

function loadState() {
  try {
    const raw = localStorage.getItem(EXAM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(state) { localStorage.setItem(EXAM_KEY, JSON.stringify(state)); }

function questions() {
  const state = loadState() || {};
  const source = state.questionBank || [];
  return source.length ? source : [];
}

function safeQuestionBank() {
  const main = loadState() || {};
  if (Array.isArray(main.questionBank) && main.questionBank.length) return main.questionBank;
  return [
    { domain: 'People', difficulty: 'Medium', stem: 'A stakeholder changes the requested priority midstream. What is the best response?', options: ['Ignore the request.', 'Reassess impact and update the plan through change control.', 'Accept it without communication.', 'Stop all work immediately.'], answer: 1, rationale: 'Scope or priority changes should be analyzed and managed through change control.' },
    { domain: 'Process', difficulty: 'Medium', stem: 'A deliverable has not met acceptance criteria. What should happen first?', options: ['Mark it complete anyway.', 'Fix the gap and revalidate against criteria.', 'Delete the criteria.', 'Cancel the work package.'], answer: 1, rationale: 'Acceptance criteria drive rework and validation before completion.' },
    { domain: 'Business Environment', difficulty: 'Medium', stem: 'What is the best indicator of real project value?', options: ['The team is busy.', 'The outcome supports organizational objectives.', 'The budget is high.', 'The schedule is full.'], answer: 1, rationale: 'Value is measured by alignment to business outcomes.' },
    { domain: 'People', difficulty: 'Easy', stem: 'Which action best shows coaching behavior?', options: ['Taking over the work.', 'Asking questions and helping the person solve the problem.', 'Ignoring mistakes.', 'Escalating immediately.'], answer: 1, rationale: 'Coaching supports independent problem-solving and growth.' },
    { domain: 'Process', difficulty: 'Hard', stem: 'A risk occurs during execution. What should the project manager do?', options: ['Wait until the phase ends.', 'Execute the planned response and track the result.', 'Delete the risk log.', 'Restart the project.'], answer: 1, rationale: 'Risk responses should be executed immediately when the risk materializes.' },
    { domain: 'Business Environment', difficulty: 'Hard', stem: 'Why is ongoing governance important?', options: ['It replaces communication.', 'It keeps decisions aligned with policy and strategy.', 'It eliminates risk.', 'It prevents change.'], answer: 1, rationale: 'Governance ensures decision-making stays aligned to organizational direction.' },
    { domain: 'People', difficulty: 'Medium', stem: 'A team member is underperforming due to unclear expectations. What should happen first?', options: ['Remove the person from the team.', 'Clarify expectations and identify blockers.', 'Ignore the problem.', 'Replace the person immediately.'], answer: 1, rationale: 'Clarity and blocker removal come before structural changes.' },
    { domain: 'Process', difficulty: 'Easy', stem: 'What is the purpose of a lessons learned session?', options: ['Assign blame.', 'Capture improvements for future work.', 'Close the budget.', 'Change the sponsor.'], answer: 1, rationale: 'Lessons learned drive continuous improvement.' },
    { domain: 'Business Environment', difficulty: 'Easy', stem: 'What should happen when strategy changes?', options: ['Continue as planned.', 'Reassess alignment and adjust the initiative.', 'Ignore it.', 'Increase status reporting only.'], answer: 1, rationale: 'Strategy changes can require reevaluation of ongoing work.' },
    { domain: 'Process', difficulty: 'Medium', stem: 'What is the strongest sign a change request is ready for approval?', options: ['The team wants it.', 'Impact has been analyzed and documented.', 'It is urgent.', 'It is requested by a stakeholder.'], answer: 1, rationale: 'Approval should be based on impact analysis, not urgency alone.' }
  ];
}

let current = loadState() || { open: false, idx: 0, flagged: [], answers: {}, notes: {}, paused: false, remaining: EXAM_MINUTES * 60, startedAt: null };
let interval = null;

function normalize() {
  if (!current.flagged) current.flagged = [];
  if (!current.answers) current.answers = {};
  if (!current.notes) current.notes = {};
  if (typeof current.idx !== 'number') current.idx = 0;
  if (typeof current.remaining !== 'number') current.remaining = EXAM_MINUTES * 60;
  if (typeof current.paused !== 'boolean') current.paused = false;
}

function launchButton() {
  if (document.querySelector('#immersion-launcher')) return;
  const btn = document.createElement('button');
  btn.id = 'immersion-launcher';
  btn.className = 'immersion-launcher';
  btn.textContent = 'Immersive Exam';
  btn.addEventListener('click', openExam);
  document.body.appendChild(btn);
}

function buildModal() {
  if (document.querySelector('#immersion-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'immersion-modal';
  modal.className = 'immersion-modal';
  modal.innerHTML = `
    <div class="immersion-shell" role="dialog" aria-modal="true" aria-labelledby="immersion-title">
      <div class="immersion-top">
        <div>
          <h2 id="immersion-title">Immersive Exam Mode</h2>
          <p>Full-screen simulator with flagging, notes, pause, and review.</p>
        </div>
        <div class="premium-row">
          <button class="btn ghost" data-exam-action="pause">Pause</button>
          <button class="btn ghost" data-exam-action="resume">Resume</button>
          <button class="btn danger" data-exam-action="exit">Exit</button>
        </div>
      </div>
      <div class="immersion-toolbar">
        <button class="btn ghost" data-exam-action="start-new">Start New</button>
        <button class="btn ghost" data-exam-action="review">Review</button>
        <button class="btn ghost" data-exam-action="fullscreen">Fullscreen</button>
        <button class="btn ghost" data-exam-action="save-progress">Save</button>
      </div>
      <div class="immersion-layout">
        <div class="immersion-nav" id="immersion-nav"></div>
        <div class="immersion-main" id="immersion-main"></div>
        <div class="immersion-side" id="immersion-side"></div>
      </div>
      <div class="immersion-footer">
        <div class="immersion-sub" id="immersion-status">Ready</div>
        <div class="immersion-progress"><i id="immersion-progress-bar"></i></div>
        <div class="immersion-sub" id="immersion-timer">90m 00s</div>
      </div>
    </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeExam(); });
  document.body.appendChild(modal);
}

function createSession() {
  const bank = safeQuestionBank();
  const pool = bank.slice(0, QUESTION_COUNT).map((q) => ({ ...q }));
  current = { open: true, idx: 0, flagged: [], answers: {}, notes: {}, paused: false, remaining: EXAM_MINUTES * 60, startedAt: new Date().toISOString(), pool };
  saveState(current);
}

function startTimer() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (!current.open || current.paused) return;
    current.remaining = Math.max(0, current.remaining - 1);
    saveState(current);
    render();
    if (current.remaining <= 0) finishExam();
  }, 1000);
}

function ensurePool() {
  if (!Array.isArray(current.pool) || !current.pool.length) {
    current.pool = safeQuestionBank().slice(0, QUESTION_COUNT).map((q) => ({ ...q }));
  }
  if (current.idx >= current.pool.length) current.idx = 0;
}

function currentQuestion() {
  ensurePool();
  return current.pool[current.idx];
}

function toggleFlag() {
  const id = current.idx;
  const flags = new Set(current.flagged || []);
  if (flags.has(id)) flags.delete(id); else flags.add(id);
  current.flagged = [...flags];
  saveState(current);
  render();
}

function saveAnswer(choice) {
  current.answers[current.idx] = choice;
  saveState(current);
  render();
}

function saveNote(value) {
  current.notes[current.idx] = value;
  saveState(current);
}

function pauseExam() {
  current.paused = true;
  saveState(current);
  render();
}

function resumeExam() {
  current.paused = false;
  saveState(current);
  render();
}

function openFullscreen() {
  const shell = document.querySelector('.immersion-shell');
  if (shell?.requestFullscreen) shell.requestFullscreen().catch(() => {});
}

function closeFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function finishExam() {
  ensurePool();
  const pool = current.pool;
  const correct = pool.filter((q, i) => current.answers[i] === q.answer).length;
  const score = Math.round((correct / pool.length) * 100);
  const domainScores = {};
  ['People', 'Process', 'Business Environment'].forEach((domain) => {
    const subset = pool.map((q, i) => ({ q, i })).filter((entry) => entry.q.domain === domain);
    const hits = subset.filter((entry) => current.answers[entry.i] === entry.q.answer).length;
    domainScores[domain] = subset.length ? Math.round((hits / subset.length) * 100) : 0;
  });
  const keys = ['exam-hall-state-v4', 'exam-hall-state-v3', 'exam-hall-state-v2', 'exam-hall-state-v1'];
  let base = null;
  let baseKey = keys[0];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { base = JSON.parse(raw); baseKey = key; break; }
    } catch {}
  }
  base = base || {};
  const history = Array.isArray(base.examHistory) ? base.examHistory : [];
  history.unshift({ date: new Date().toISOString(), score, total: pool.length, domainScores, answers: current.answers, pool });
  base.examHistory = history.slice(0, 12);
  if (score >= (base.goal || 80)) base.streak = (base.streak || 0) + 1;
  localStorage.setItem(baseKey, JSON.stringify(base));
  current.open = false;
  saveState(current);
  closeExam();
  toast('Exam submitted', `Final score: ${score}%.`);
}

function toast(title, body) {
  const host = document.querySelector('#exam-toast-host') || (() => {
    const el = document.createElement('div');
    el.id = 'exam-toast-host';
    el.style.position = 'fixed';
    el.style.right = '18px';
    el.style.top = '18px';
    el.style.zIndex = '260';
    el.style.display = 'grid';
    el.style.gap = '10px';
    document.body.appendChild(el);
    return el;
  })();
  const node = document.createElement('div');
  node.style.minWidth = '240px';
  node.style.maxWidth = '360px';
  node.style.padding = '12px 14px';
  node.style.borderRadius = '16px';
  node.style.border = '1px solid #35546d';
  node.style.background = 'rgba(11,24,38,.94)';
  node.style.color = '#eef4fb';
  node.style.boxShadow = '0 18px 55px rgba(0,0,0,.28)';
  node.innerHTML = `<div style="font-weight:800;margin-bottom:4px">${title}</div><div style="color:#b0c0d2;font-size:12px;line-height:1.45">${body}</div>`;
  host.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function renderNav() {
  const nav = document.querySelector('#immersion-nav');
  if (!nav) return;
  ensurePool();
  nav.innerHTML = current.pool.map((q, i) => `
    <button class="immersion-qdot ${i === current.idx ? 'active' : ''} ${current.flagged.includes(i) ? 'flagged' : ''} ${current.answers[i] !== undefined ? 'answered' : ''}" data-go-question="${i}">${i + 1}</button>
  `).join('');
  nav.querySelectorAll('[data-go-question]').forEach((btn) => btn.addEventListener('click', () => { current.idx = Number(btn.dataset.goQuestion); saveState(current); render(); }));
}

function renderMain() {
  const host = document.querySelector('#immersion-main');
  if (!host) return;
  ensurePool();
  const q = currentQuestion();
  const answer = current.answers[current.idx];
  const completed = Object.keys(current.answers).length;
  host.innerHTML = `
    <div class="premium-row" style="justify-content:space-between;align-items:center;">
      <div>
        <h3>Question ${current.idx + 1} of ${current.pool.length}</h3>
        <div class="meta">${q.domain} • ${q.difficulty}</div>
      </div>
      <button class="btn ghost" data-exam-action="flag">${current.flagged.includes(current.idx) ? 'Unflag' : 'Flag'}</button>
    </div>
    <p style="margin-top:12px;">${q.stem}</p>
    <div class="immersion-options">
      ${q.options.map((opt, i) => {
        const cls = answer === undefined ? 'immersion-option' : i === q.answer ? 'immersion-option correct' : i === answer ? 'immersion-option wrong' : 'immersion-option';
        return `<button class="${cls}" data-answer="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`;
      }).join('')}
    </div>
    <div style="margin-top:12px; padding:12px; border-radius:16px; border:1px solid #233648; background:rgba(255,255,255,.03);">
      <div class="meta">Rationale</div>
      <div style="margin-top:6px; color:#dce7f2; line-height:1.55;">${answer === undefined ? 'Answer the question to reveal guidance after submission.' : q.rationale}</div>
    </div>
  `;
  host.querySelectorAll('[data-answer]').forEach((btn) => btn.addEventListener('click', () => saveAnswer(Number(btn.dataset.answer))));
  host.querySelector('[data-exam-action="flag"]')?.addEventListener('click', toggleFlag);
}

function renderSide() {
  const host = document.querySelector('#immersion-side');
  if (!host) return;
  ensurePool();
  const q = currentQuestion();
  host.innerHTML = `
    <div class="immersion-box">
      <h4>Exam timer</h4>
      <div class="immersion-timer">${formatTime(current.remaining)}</div>
      <div class="meta">${current.paused ? 'Paused' : 'Running'}</div>
    </div>
    <div class="immersion-box">
      <h4>Navigation</h4>
      <div class="meta">Answered ${Object.keys(current.answers).length}/${current.pool.length}</div>
      <div class="meta">Flagged ${current.flagged.length}</div>
      <div class="meta">Current domain ${q.domain}</div>
    </div>
    <div class="immersion-box">
      <h4>Private notes</h4>
      <textarea class="immersion-note" id="immersion-note" placeholder="Write a quick note for this question...">${current.notes[current.idx] || ''}</textarea>
    </div>
    <div class="immersion-box">
      <h4>Session controls</h4>
      <div class="premium-row">
        <button class="btn ghost" data-exam-action="prev">Previous</button>
        <button class="btn ghost" data-exam-action="next">Next</button>
      </div>
    </div>
  `;
  host.querySelector('#immersion-note')?.addEventListener('input', (e) => saveNote(e.target.value));
  host.querySelector('[data-exam-action="prev"]')?.addEventListener('click', () => { current.idx = (current.idx - 1 + current.pool.length) % current.pool.length; saveState(current); render(); });
  host.querySelector('[data-exam-action="next"]')?.addEventListener('click', () => { current.idx = (current.idx + 1) % current.pool.length; saveState(current); render(); });
}

function renderFooter() {
  const timer = document.querySelector('#immersion-timer');
  const progress = document.querySelector('#immersion-progress-bar');
  const status = document.querySelector('#immersion-status');
  if (timer) timer.textContent = formatTime(current.remaining);
  if (progress) progress.style.width = `${(Object.keys(current.answers).length / current.pool.length) * 100}%`;
  if (status) status.textContent = current.paused ? 'Paused' : `Active • ${Object.keys(current.answers).length}/${current.pool.length} answered`;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}m ${s}s`;
}

function render() {
  if (!current.open) return;
  renderNav();
  renderMain();
  renderSide();
  renderFooter();
}

function openExam() {
  ensurePool();
  if (!current.open) createSession();
  current.open = true;
  current.paused = false;
  saveState(current);
  buildModal();
  document.querySelector('#immersion-modal')?.classList.add('open');
  render();
  startTimer();
}

function closeExam() {
  document.querySelector('#immersion-modal')?.classList.remove('open');
  if (document.fullscreenElement) closeFullscreen();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-exam-action]')?.dataset.examAction;
    if (!action) return;
    if (action === 'pause') pauseExam();
    if (action === 'resume') resumeExam();
    if (action === 'exit') closeExam();
    if (action === 'start-new') { createSession(); saveState(current); render(); }
    if (action === 'review') toast('Review mode', 'Use the main app reports tab for review flow.');
    if (action === 'fullscreen') openFullscreen();
    if (action === 'save-progress') { saveState(current); toast('Saved', 'Exam progress stored locally.'); }
    if (action === 'flag') toggleFlag();
  });
  document.addEventListener('keydown', (event) => {
    if (!current.open) return;
    if (event.key === 'Escape') closeExam();
    if (event.key === 'ArrowRight') { current.idx = (current.idx + 1) % current.pool.length; saveState(current); render(); }
    if (event.key === 'ArrowLeft') { current.idx = (current.idx - 1 + current.pool.length) % current.pool.length; saveState(current); render(); }
    if (event.key.toLowerCase() === 'f') toggleFlag();
    if (event.key.toLowerCase() === 'p') current.paused ? resumeExam() : pauseExam();
  });
}

function boot() {
  normalize();
  launchButton();
  ensurePool();
  buildModal();
  bindEvents();
  startTimer();
}

boot();
