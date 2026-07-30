import { domains, lessons, practiceQuestions, flashcards } from './data.js';

const STORAGE_KEY = 'exam-hall-state-v4';
const app = document.querySelector('#app');

const defaultState = {
  tab: 'dashboard',
  savedQuestions: [],
  completedLessons: [],
  examHistory: [],
  streak: 7,
  goal: 80,
  currentPractice: 0,
  practiceChoice: null,
  examRunning: false,
  examSeconds: 90 * 60,
  examIndex: 0,
  examAnswers: {},
  examPool: [],
  reviewMode: false,
  reviewIndex: 0,
};

let state = loadState() ?? clone(defaultState);
let timerHandle = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

function shuffle(input) {
  const values = [...input];
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function latestSession() {
  return state.examHistory[0] ?? null;
}

function readinessScore() {
  const lessonPct = percent(state.completedLessons.length, lessons.length);
  const savedPct = percent(state.savedQuestions.length, practiceQuestions.length);
  const last = latestSession();
  const scorePct = last ? last.score : 0;
  return clamp(Math.round((lessonPct * 0.3) + (savedPct * 0.2) + (scorePct * 0.5)), 0, 100);
}

function sessionDomainScore(domain) {
  if (!state.examHistory.length) {
    return domain === 'People' ? 68 : domain === 'Process' ? 64 : 70;
  }
  const scores = state.examHistory
    .map((session) => session.domainScores?.[domain])
    .filter((value) => Number.isFinite(value));
  if (!scores.length) {
    return domain === 'People' ? 68 : domain === 'Process' ? 64 : 70;
  }
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

function topWeakDomain() {
  return [...domains]
    .map((domain) => ({ domain, score: sessionDomainScore(domain) }))
    .sort((a, b) => a.score - b.score)[0];
}

function currentQuestion() {
  return practiceQuestions[state.currentPractice % practiceQuestions.length];
}

function ensureExamPool() {
  if (!state.examPool.length) {
    state.examPool = shuffle(practiceQuestions).slice(0, 10);
  }
}

function startExam() {
  state.examRunning = true;
  state.reviewMode = false;
  state.examSeconds = 90 * 60;
  state.examIndex = 0;
  state.examAnswers = {};
  state.examPool = shuffle(practiceQuestions).slice(0, 10);
  state.tab = 'exam';
  saveState();
  startTimer();
  render();
}

function finishExam() {
  const pool = state.examPool.length ? state.examPool : practiceQuestions.slice(0, 10);
  const correct = pool.filter((question, index) => state.examAnswers[index] === question.answer).length;
  const score = Math.round((correct / pool.length) * 100);
  const domainScores = {};

  domains.forEach((domain) => {
    const domainQuestions = pool
      .map((question, index) => ({ question, index }))
      .filter((entry) => entry.question.domain === domain);
    const hits = domainQuestions.filter((entry) => state.examAnswers[entry.index] === entry.question.answer).length;
    domainScores[domain] = domainQuestions.length ? Math.round((hits / domainQuestions.length) * 100) : 0;
  });

  state.examRunning = false;
  state.reviewMode = true;
  state.reviewIndex = 0;
  state.examHistory.unshift({
    date: new Date().toISOString(),
    score,
    total: pool.length,
    domainScores,
    answers: state.examAnswers,
    pool,
  });
  state.examHistory = state.examHistory.slice(0, 12);
  if (score >= state.goal) {
    state.streak += 1;
  }
  saveState();
  render();
}

function startTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
  }
  timerHandle = setInterval(() => {
    if (!state.examRunning) {
      return;
    }
    state.examSeconds -= 1;
    if (state.examSeconds <= 0) {
      state.examSeconds = 0;
      saveState();
      finishExam();
      return;
    }
    const timer = document.querySelector('#examTimer');
    if (timer) {
      timer.textContent = formatDuration(state.examSeconds);
    }
    saveState();
  }, 1000);
}

function setTab(tab) {
  state.tab = tab;
  saveState();
  render();
}

function toggleLesson(id) {
  const index = state.completedLessons.indexOf(id);
  if (index >= 0) {
    state.completedLessons.splice(index, 1);
  } else {
    state.completedLessons.push(id);
  }
  saveState();
  render();
}

function toggleSave(id) {
  const index = state.savedQuestions.indexOf(id);
  if (index >= 0) {
    state.savedQuestions.splice(index, 1);
  } else {
    state.savedQuestions.push(id);
  }
  saveState();
  render();
}

function markPracticeChoice(choice) {
  state.practiceChoice = choice;
  saveState();
  render();
}

function updateNav() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === state.tab);
  });
}

function renderMetrics() {
  const metrics = [
    { k: 'Readiness', v: `${readinessScore()}%`, s: 'Composite study readiness' },
    { k: 'Streak', v: `${state.streak}d`, s: 'Consecutive active days' },
    { k: 'Saved', v: String(state.savedQuestions.length), s: 'Questions flagged for review' },
    { k: 'Last score', v: latestSession() ? `${latestSession().score}%` : '—', s: 'Latest mock exam result' },
  ];

  document.querySelector('#metrics').innerHTML = metrics
    .map((metric) => `
      <div class="card">
        <div class="k">${metric.k}</div>
        <div class="v">${metric.v}</div>
        <div class="s">${metric.s}</div>
      </div>
    `)
    .join('');
}

function renderFocus() {
  const weak = topWeakDomain();
  const nextLesson = lessons.find((lesson) => !state.completedLessons.includes(lesson.id)) ?? lessons[0];
  document.querySelector('#focusArea').innerHTML = `
    <div class="item">
      <div class="itemtop">
        <div>
          <b>Next lesson</b>
          <div class="meta">${nextLesson.title} • ${nextLesson.domain} • ${nextLesson.minutes} min</div>
        </div>
        <div class="badge">${nextLesson.domain}</div>
      </div>
      <p>${nextLesson.detail}</p>
      <div class="progressLine">
        <div class="meter"><i style="width:${percent(state.completedLessons.includes(nextLesson.id) ? 1 : 0, 1)}%"></i></div>
      </div>
    </div>
    <div class="item" style="margin-top:12px">
      <div class="itemtop">
        <div>
          <b>Priority domain</b>
          <div class="meta">Lower attention based on current activity</div>
        </div>
        <div class="badge">${weak.domain}</div>
      </div>
      <p>Review ${weak.domain.toLowerCase()} items, then complete a 10-question drill and a timed review pass.</p>
    </div>
  `;
}

function renderDashboard() {
  document.querySelector('#tabArea').innerHTML = `
    <h3>Dashboard</h3>
    <p class="sub">At-a-glance status, plan progress, and exam readiness.</p>
    <div class="split">
      <div class="item">
        <div class="itemtop">
          <div>
            <b>Readiness meter</b>
            <div class="meta">Based on lessons, saved items, and recent scores</div>
          </div>
          <div class="badge">${readinessScore()}%</div>
        </div>
        <div class="meter" style="margin-top:12px"><i style="width:${readinessScore()}%"></i></div>
        <p class="small" style="margin-top:10px">Goal: ${state.goal}% to feel fully exam-ready.</p>
      </div>
      <div class="item">
        <div class="itemtop">
          <div>
            <b>Learning momentum</b>
            <div class="meta">Streak and activity</div>
          </div>
          <div class="badge">${state.streak}d</div>
        </div>
        <p>Keep the streak alive by completing at least one lesson, question block, or exam session today.</p>
      </div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn" data-action="goto-practice">Start practice</button>
      <button class="btn ghost" data-action="goto-exam">Launch mock exam</button>
      <button class="btn warn" data-action="goto-plan">Open learning plan</button>
    </div>
    <div class="item" style="margin-top:12px">
      <b>Recent history</b>
      <div class="meta">Last 5 mock exam attempts</div>
      <div class="list" style="margin-top:10px">
        ${state.examHistory.length ? state.examHistory.slice(0, 5).map((session) => `
          <div class="item" style="margin:0">
            <div class="itemtop">
              <div>
                <b>${session.score}%</b>
                <div class="meta">${new Date(session.date).toLocaleString()}</div>
              </div>
              <div class="badge">${session.total} questions</div>
            </div>
          </div>
        `).join('') : `<div class="note">No exam history yet. Start a mock exam to generate analytics.</div>`}
      </div>
    </div>
  `;
}

function renderPlan() {
  document.querySelector('#tabArea').innerHTML = `
    <h3>Learning Plan</h3>
    <p class="sub">A compact schedule you can mark as complete as you work through the material.</p>
    <div class="list">
      ${lessons.map((lesson) => {
        const done = state.completedLessons.includes(lesson.id);
        return `
          <div class="item">
            <div class="itemtop">
              <div>
                <b>${lesson.title}</b>
                <div class="meta">${lesson.domain} • ${lesson.minutes} min</div>
              </div>
              <div class="badge">${done ? 'Done' : 'Open'}</div>
            </div>
            <p>${lesson.detail}</p>
            <div class="row" style="margin-top:10px">
              <button class="btn ${done ? 'ghost' : ''}" data-lesson="${lesson.id}">${done ? 'Mark open' : 'Mark done'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPractice() {
  const question = currentQuestion();
  const saved = state.savedQuestions.includes(question.id);
  const choice = state.practiceChoice;
  document.querySelector('#tabArea').innerHTML = `
    <h3>Practice Questions</h3>
    <p class="sub">Review one question at a time. Save anything you want to revisit later.</p>
    <div class="toolbar">
      <button class="btn ghost" data-action="prev-practice">Previous</button>
      <button class="btn ghost" data-action="next-practice">Next</button>
      <button class="btn ${saved ? '' : 'ghost'}" data-action="save-practice">${saved ? 'Saved' : 'Save question'}</button>
      <button class="btn warn" data-action="clear-practice">Clear answer</button>
    </div>
    <div class="item">
      <div class="itemtop">
        <div>
          <b>Question ${question.id} of ${practiceQuestions.length}</b>
          <div class="meta">${question.domain} • ${question.difficulty}</div>
        </div>
        <div class="badge">${question.domain}</div>
      </div>
      <p>${question.stem}</p>
      <div id="practiceOptions"></div>
      ${choice === null ? '' : `<div class="note" style="margin-top:12px">${choice === question.answer ? 'Correct.' : 'Incorrect.'} ${question.rationale}</div>`}
    </div>
  `;

  document.querySelector('#practiceOptions').innerHTML = question.options.map((option, index) => {
    const prefix = ['A', 'B', 'C', 'D'][index];
    const cls = choice === null ? 'option' : index === question.answer ? 'option correct' : index === choice ? 'option wrong' : 'option';
    return `<button class="${cls}" data-choice="${index}">${prefix}. ${option}</button>`;
  }).join('');
}

function renderExam() {
  if (state.reviewMode) {
    renderReview();
    return;
  }

  if (!state.examRunning && state.examHistory.length === 0 && state.examPool.length === 0) {
    document.querySelector('#tabArea').innerHTML = `
      <h3>Mock Exam</h3>
      <p class="sub">Timed exam mode with review after submission.</p>
      <div class="note">Default format: 10 questions, 90 minutes. The pool is randomized from the original bank.</div>
      <div class="row" style="margin-top:12px">
        <button class="btn" data-action="start-exam">Start new exam</button>
      </div>
    `;
    return;
  }

  ensureExamPool();
  const question = state.examPool[state.examIndex];
  const answered = state.examAnswers[state.examIndex];
  const doneCount = Object.keys(state.examAnswers).length;

  document.querySelector('#tabArea').innerHTML = `
    <div class="examhead">
      <div>
        <h3 style="margin:0">Mock Exam</h3>
        <div class="meta">${doneCount}/${state.examPool.length} answered</div>
      </div>
      <div class="timer" id="examTimer">${formatDuration(state.examSeconds)}</div>
    </div>
    <div class="meter"><i style="width:${percent(doneCount, state.examPool.length)}%"></i></div>
    <div class="questionnav" style="margin:14px 0">
      ${state.examPool.map((_, index) => `
        <button class="qdot ${index === state.examIndex ? 'active' : ''} ${state.examAnswers[index] !== undefined ? 'answered' : ''}" data-go="${index}">${index + 1}</button>
      `).join('')}
    </div>
    <div class="item">
      <div class="itemtop">
        <div>
          <b>Question ${state.examIndex + 1}</b>
          <div class="meta">${question.domain} • ${question.difficulty}</div>
        </div>
        <div class="badge">${question.domain}</div>
      </div>
      <p>${question.stem}</p>
      <div id="examOptions"></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn ghost" data-action="prev-exam">Previous</button>
      <button class="btn ghost" data-action="next-exam">Next</button>
      <button class="btn danger" data-action="submit-exam">Submit exam</button>
    </div>
  `;

  document.querySelector('#examOptions').innerHTML = question.options.map((option, index) => {
    const prefix = ['A', 'B', 'C', 'D'][index];
    const cls = answered === index ? 'option correct' : 'option';
    return `<button class="${cls}" data-exam-choice="${index}">${prefix}. ${option}</button>`;
  }).join('');
}

function renderReview() {
  const session = latestSession();
  const pool = session?.pool ?? [];
  if (!pool.length) {
    state.reviewMode = false;
    saveState();
    renderExam();
    return;
  }

  const index = state.reviewIndex % pool.length;
  const question = pool[index];
  const picked = session.answers?.[index];
  const missed = picked !== question.answer;

  document.querySelector('#tabArea').innerHTML = `
    <h3>Review Mode</h3>
    <p class="sub">Walk through the last exam, question by question, with correctness and rationale.</p>
    <div class="item">
      <div class="itemtop">
        <div>
          <b>Exam result: ${session.score}%</b>
          <div class="meta">${new Date(session.date).toLocaleString()}</div>
        </div>
        <div class="badge">${missed ? 'Missed' : 'Correct'}</div>
      </div>
      <p><b>${index + 1}. ${question.stem}</b></p>
      <div class="questionnav" style="margin:12px 0">
        ${pool.map((entry, i) => `
          <button class="qdot ${i === index ? 'active' : ''} ${session.answers?.[i] !== undefined ? (session.answers[i] === entry.answer ? 'answered' : 'missed') : ''}" data-review="${i}">${i + 1}</button>
        `).join('')}
      </div>
      <div class="list">
        ${question.options.map((option, i) => {
          const prefix = ['A', 'B', 'C', 'D'][i];
          const cls = i === question.answer ? 'option correct' : picked === i ? 'option wrong' : 'option';
          return `<button class="${cls}" disabled>${prefix}. ${option}</button>`;
        }).join('')}
      </div>
      <div class="note" style="margin-top:12px">${question.rationale}</div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn ghost" data-action="prev-review">Previous</button>
      <button class="btn ghost" data-action="next-review">Next</button>
      <button class="btn warn" data-action="exit-review">Exit review</button>
    </div>
  `;
}

function renderReports() {
  const session = latestSession();
  const rows = domains.map((domain) => ({
    domain,
    score: sessionDomainScore(domain),
    total: practiceQuestions.filter((question) => question.domain === domain).length,
  }));

  const missed = session ? (session.pool ?? []).filter((question, index) => session.answers?.[index] !== question.answer) : [];

  document.querySelector('#tabArea').innerHTML = `
    <h3>Score Reports</h3>
    <p class="sub">Domain breakdown, weak points, and a review list from the last exam.</p>
    ${session ? `
      <div class="reportGrid">
        <div class="reportBox"><h4>Latest score</h4><div class="score">${session.score}%</div><div class="meta">${session.total} questions</div></div>
        <div class="reportBox"><h4>Average domain score</h4><div class="score">${Math.round((session.domainScores.People + session.domainScores.Process + session.domainScores['Business Environment']) / 3)}%</div><div class="meta">Last exam</div></div>
        <div class="reportBox"><h4>Target</h4><div class="score">${state.goal}%</div><div class="meta">Your current goal score</div></div>
      </div>
    ` : `<div class="note">Run a mock exam first to generate a score report.</div>`}
    <div class="list" style="margin-top:12px">
      ${rows.map((row) => `
        <div class="item">
          <div class="itemtop">
            <div>
              <b>${row.domain}</b>
              <div class="meta">${row.total} questions in bank</div>
            </div>
            <div class="badge">${row.score}%</div>
          </div>
          <div class="meter" style="margin-top:12px"><i style="width:${row.score}%"></i></div>
        </div>
      `).join('')}
    </div>
    <div class="split" style="margin-top:12px">
      <div class="item">
        <b>Missed questions</b>
        <div class="meta">Last exam only</div>
        <div class="list" style="margin-top:10px">
          ${missed.length ? missed.map((question) => `
            <div class="item" style="margin:0">
              <div class="itemtop">
                <div>
                  <b>${question.domain}</b>
                  <div class="meta">${question.difficulty}</div>
                </div>
                <div class="badge">Missed</div>
              </div>
              <p>${question.stem}</p>
            </div>
          `).join('') : `<div class="note">No missed questions recorded in the latest exam.</div>`}
        </div>
      </div>
      <div class="item">
        <b>Recommended next step</b>
        <div class="meta">Based on the lowest domain score</div>
        <div class="taglist">${rows.sort((a, b) => a.score - b.score).slice(0, 3).map((row) => `<span class="tag">${row.domain}</span>`).join('')}</div>
        <p style="margin-top:10px">Use the practice tab for the lowest domain, then repeat a mock exam and compare the new report.</p>
      </div>
    </div>
  `;
}

function renderCards() {
  const card = flashcards[state.currentPractice % flashcards.length];
  document.querySelector('#tabArea').innerHTML = `
    <h3>Flashcards</h3>
    <p class="sub">Tap to flip. Use these for fast recall and short review loops.</p>
    <div class="flash">
      <div class="flashcard" id="flashcard">
        <div class="face front">
          <div class="itemtop">
            <div>
              <b>Front</b>
              <div class="meta">Card ${state.currentPractice % flashcards.length + 1} of ${flashcards.length}</div>
            </div>
            <div class="badge">Recall</div>
          </div>
          <h4 style="margin-top:14px">${card.front}</h4>
          <p style="margin-top:10px">Tap to reveal the answer.</p>
        </div>
        <div class="face back">
          <div class="itemtop">
            <div>
              <b>Back</b>
              <div class="meta">Answer</div>
            </div>
            <div class="badge">Study</div>
          </div>
          <h4 style="margin-top:14px">${card.back}</h4>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn ghost" data-action="prev-card">Previous</button>
      <button class="btn" data-action="flip-card">Flip card</button>
      <button class="btn ghost" data-action="next-card">Next</button>
    </div>
  `;
}

function renderSessions() {
  const sessions = state.examHistory;
  const trend = sessions.length
    ? sessions.slice(0, 6).map((session, index) => `
      <div class="barrow" style="display:grid;grid-template-columns:72px 1fr 52px;gap:10px;align-items:center;margin-bottom:10px">
        <div class="meta">Run ${index + 1}</div>
        <div class="meter"><i style="width:${session.score}%"></i></div>
        <div class="meta">${session.score}%</div>
      </div>
    `).join('')
    : `<div class="note">No exam sessions stored yet. Run a mock exam first.</div>`;

  const list = sessions.length
    ? sessions.map((session, index) => `
      <div class="sessionCard" style="margin-bottom:10px">
        <div class="itemtop">
          <div>
            <b>Session ${index + 1}</b>
            <div class="meta">${new Date(session.date).toLocaleString()}</div>
          </div>
          <div class="badge">${session.score}%</div>
        </div>
        <div class="split" style="margin-top:10px">
          <div>
            <div class="meta">People: ${session.domainScores.People ?? 0}%</div>
            <div class="meter" style="margin-top:6px"><i style="width:${session.domainScores.People ?? 0}%"></i></div>
          </div>
          <div>
            <div class="meta">Process: ${session.domainScores.Process ?? 0}%</div>
            <div class="meter" style="margin-top:6px"><i style="width:${session.domainScores.Process ?? 0}%"></i></div>
          </div>
        </div>
        <div style="margin-top:10px">
          <div class="meta">Business Environment: ${session.domainScores['Business Environment'] ?? 0}%</div>
          <div class="meter" style="margin-top:6px"><i style="width:${session.domainScores['Business Environment'] ?? 0}%"></i></div>
        </div>
      </div>
    `).join('')
    : `<div class="note">No sessions recorded yet.</div>`;

  const last = latestSession();
  const completionPct = percent(state.completedLessons.length, lessons.length);
  document.querySelector('#tabArea').innerHTML = `
    <h3>Session History</h3>
    <p class="sub">Track every mock exam, inspect the trend, and review domain performance.</p>
    <div class="reportGrid">
      <div class="reportBox"><h4>Readiness</h4><div class="score">${readinessScore()}%</div><div class="meta">Composite local signal</div></div>
      <div class="reportBox"><h4>Completion</h4><div class="score">${completionPct}%</div><div class="meta">Lessons completed</div></div>
      <div class="reportBox"><h4>Last score</h4><div class="score">${last ? `${last.score}%` : '—'}</div><div class="meta">Most recent mock exam</div></div>
    </div>
    <div class="split" style="margin-top:12px">
      <div class="item">
        <b>Score trend</b>
        <div class="meta">Newest to oldest</div>
        <div style="margin-top:10px">${trend}</div>
      </div>
      <div class="item">
        <b>Study mix</b>
        <div class="meta">Local progress signals</div>
        <div class="taglist">
          <span class="tag">${state.streak} day streak</span>
          <span class="tag">${state.savedQuestions.length} saved</span>
          <span class="tag">${state.completedLessons.length} lessons</span>
          <span class="tag">${sessions.length} sessions</span>
        </div>
        <p style="margin-top:10px">Use the trend to compare each new mock exam against the previous one and watch the weakest domain first.</p>
      </div>
    </div>
    <div class="list" style="margin-top:12px">${list}</div>
  `;
}

function renderSettings() {
  document.querySelector('#tabArea').innerHTML = `
    <h3>Settings</h3>
    <p class="sub">Adjust your goal or clear local data on this device.</p>
    <div class="item">
      <b>Goal score</b>
      <div class="meta">Current target: ${state.goal}%</div>
      <input class="field" id="goalInput" type="range" min="50" max="100" value="${state.goal}" style="margin-top:12px">
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn" data-action="save-goal">Save goal</button>
      <button class="btn danger" data-action="reset-all">Reset local progress</button>
    </div>
    <div class="note" style="margin-top:12px">This app stores progress in localStorage only. No backend is required.</div>
  `;
}

function bindTabButtons() {
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.tab));
  });
}

function bindActions() {
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action], [data-lesson], [data-choice], [data-exam-choice], [data-go], [data-review]');
    if (!target) return;

    const action = target.dataset.action;

    if (target.dataset.lesson) {
      toggleLesson(target.dataset.lesson);
      return;
    }
    if (target.dataset.choice !== undefined) {
      markPracticeChoice(Number(target.dataset.choice));
      return;
    }
    if (target.dataset.examChoice !== undefined) {
      state.examAnswers[state.examIndex] = Number(target.dataset.examChoice);
      saveState();
      render();
      return;
    }
    if (target.dataset.go !== undefined) {
      state.examIndex = Number(target.dataset.go);
      saveState();
      render();
      return;
    }
    if (target.dataset.review !== undefined) {
      state.reviewIndex = Number(target.dataset.review);
      saveState();
      render();
      return;
    }

    switch (action) {
      case 'goto-practice':
        setTab('practice');
        break;
      case 'goto-exam':
        startExam();
        break;
      case 'goto-plan':
        setTab('plan');
        break;
      case 'start-exam':
        startExam();
        break;
      case 'save-practice':
        toggleSave(currentQuestion().id);
        break;
      case 'clear-practice':
        state.practiceChoice = null;
        saveState();
        render();
        break;
      case 'prev-practice':
        state.currentPractice = (state.currentPractice - 1 + practiceQuestions.length) % practiceQuestions.length;
        state.practiceChoice = null;
        saveState();
        render();
        break;
      case 'next-practice':
        state.currentPractice = (state.currentPractice + 1) % practiceQuestions.length;
        state.practiceChoice = null;
        saveState();
        render();
        break;
      case 'prev-exam':
        state.examIndex = (state.examIndex - 1 + state.examPool.length) % state.examPool.length;
        saveState();
        render();
        break;
      case 'next-exam':
        state.examIndex = (state.examIndex + 1) % state.examPool.length;
        saveState();
        render();
        break;
      case 'submit-exam':
        finishExam();
        break;
      case 'prev-review':
        state.reviewIndex = (state.reviewIndex - 1 + (latestSession()?.pool?.length ?? 1)) % (latestSession()?.pool?.length ?? 1);
        saveState();
        render();
        break;
      case 'next-review':
        state.reviewIndex = (state.reviewIndex + 1) % (latestSession()?.pool?.length ?? 1);
        saveState();
        render();
        break;
      case 'exit-review':
        state.reviewMode = false;
        state.tab = 'reports';
        saveState();
        render();
        break;
      case 'flip-card': {
        const card = document.querySelector('#flashcard');
        if (card) card.classList.toggle('flipped');
        break;
      }
      case 'prev-card':
        state.currentPractice = (state.currentPractice - 1 + flashcards.length) % flashcards.length;
        saveState();
        render();
        break;
      case 'next-card':
        state.currentPractice = (state.currentPractice + 1) % flashcards.length;
        saveState();
        render();
        break;
      case 'save-goal': {
        const goalInput = document.querySelector('#goalInput');
        if (goalInput) {
          state.goal = Number(goalInput.value);
          saveState();
          render();
        }
        break;
      }
      case 'reset-all':
        if (confirm('Clear all local progress on this device?')) {
          localStorage.removeItem(STORAGE_KEY);
          state = clone(defaultState);
          saveState();
          render();
        }
        break;
      default:
        break;
    }
  });
}

function renderTab() {
  if (state.tab === 'dashboard') renderDashboard();
  if (state.tab === 'plan') renderPlan();
  if (state.tab === 'practice') renderPractice();
  if (state.tab === 'exam') renderExam();
  if (state.tab === 'reports') renderReports();
  if (state.tab === 'flashcards') renderCards();
  if (state.tab === 'sessions') renderSessions();
  if (state.tab === 'settings') renderSettings();
  updateNav();
}

function render() {
  renderMetrics();
  renderFocus();
  renderTab();
}

function mount() {
  app.innerHTML = `
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <div class="logo" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5.2-3.5 9.9-8 10-4.5-.1-8-4.8-8-10V6l8-4zm0 4.1L7 8v4c0 3.7 2.2 7 5 7s5-3.3 5-7V8l-5-1.9z"/></svg>
          </div>
          <div>
            <h1>Exam Hall</h1>
            <p>Study Hall style exam prep, rebuilt as an original platform</p>
          </div>
        </div>
        <div class="pill" id="statusPill">Offline-ready • Local progress saved</div>
      </header>

      <div class="layout">
        <aside class="side">
          <button class="navbtn active" data-tab="dashboard"><div><strong>Dashboard</strong><span>Readiness and streak</span></div><span>01</span></button>
          <button class="navbtn" data-tab="plan"><div><strong>Learning Plan</strong><span>Daily tasks and pacing</span></div><span>02</span></button>
          <button class="navbtn" data-tab="practice"><div><strong>Practice</strong><span>Question bank and review</span></div><span>03</span></button>
          <button class="navbtn" data-tab="exam"><div><strong>Mock Exam</strong><span>Timed full-length mode</span></div><span>04</span></button>
          <button class="navbtn" data-tab="reports"><div><strong>Score Reports</strong><span>Misses and domain gaps</span></div><span>05</span></button>
          <button class="navbtn" data-tab="flashcards"><div><strong>Flashcards</strong><span>Rapid recall drills</span></div><span>06</span></button>
          <button class="navbtn" data-tab="sessions"><div><strong>Session History</strong><span>Trend and past runs</span></div><span>07</span></button>
          <button class="navbtn" data-tab="settings"><div><strong>Settings</strong><span>Goals and reset tools</span></div><span>08</span></button>
        </aside>

        <main class="main">
          <section class="hero">
            <span class="eyebrow">PMI-inspired structure • original implementation</span>
            <h2>Train with dashboard, learning plan, practice blocks, timed exams, score reports, sessions, and flashcards.</h2>
            <p>This build mirrors the kind of study flow used by premium exam-prep products, but it uses original UI, original text, and original logic. The app stores progress locally and can run as a static GitHub Pages-style experience.</p>
            <div class="metrics" id="metrics"></div>
          </section>

          <div class="grid2">
            <section class="panel" id="tabArea"></section>
            <section class="panel">
              <h3>Today’s focus</h3>
              <p class="sub">The next best lesson and the lowest-performing domain.</p>
              <div id="focusArea"></div>
            </section>
          </div>
        </main>
      </div>
    </div>

    <div class="footerbar">
      <div class="navs">
        <button data-tab="dashboard" class="active">Dashboard</button>
        <button data-tab="plan">Plan</button>
        <button data-tab="practice">Practice</button>
        <button data-tab="exam">Exam</button>
        <button data-tab="reports">Reports</button>
      </div>
    </div>
  `;
  bindTabButtons();
  bindActions();
  if (state.tab === 'exam') startTimer();
  render();
  document.querySelector('#statusPill').textContent = state.examHistory.length ? `Loaded ${state.examHistory.length} session(s)` : 'Offline-ready • Local progress saved';
}

mount();