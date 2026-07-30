const AUTH_KEY = 'exam-hall-auth-v1';

const style = document.createElement('style');
style.textContent = `
  .auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at top, rgba(11,24,38,.96), rgba(7,17,26,.98));
    backdrop-filter: blur(12px);
  }
  .auth-shell {
    width: min(560px, calc(100vw - 24px));
    border: 1px solid #35546d;
    border-radius: 28px;
    background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
    box-shadow: 0 30px 120px rgba(0,0,0,.55);
    overflow: hidden;
  }
  .auth-hero {
    padding: 26px 24px 20px;
    border-bottom: 1px solid #203346;
    position: relative;
  }
  .auth-hero:before {
    content: '';
    position: absolute;
    top: -80px;
    right: -40px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(141,210,255,.18), transparent 65%);
  }
  .auth-title {
    margin: 0;
    font-size: 28px;
    letter-spacing: -.04em;
  }
  .auth-sub {
    margin: 10px 0 0;
    color: #b0c0d2;
    line-height: 1.5;
  }
  .auth-body { padding: 20px 24px 24px; }
  .auth-grid { display: grid; gap: 12px; }
  .auth-field {
    width: 100%;
    padding: 13px 14px;
    border: 1px solid #274053;
    border-radius: 16px;
    background: #0c1723;
    color: #eef4fb;
    outline: none;
  }
  .auth-row { display:flex; gap:10px; flex-wrap:wrap; margin-top: 8px; }
  .auth-chipline { display:flex; gap:8px; flex-wrap:wrap; margin-top: 12px; }
  .auth-chip {
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid #2e4a62;
    background: rgba(255,255,255,.04);
    color: #d9e4ef;
    font-size: 11px;
  }
  .auth-note {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(141,210,255,.08);
    border: 1px solid #2e4a62;
    color: #d5e8f8;
    font-size: 12px;
    line-height: 1.45;
  }
`;
document.head.appendChild(style);

function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : { unlocked: false, email: '', name: '' };
  } catch {
    return { unlocked: false, email: '', name: '' };
  }
}

function saveAuth(value) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(value));
}

let auth = loadAuth();

function ensureOverlay() {
  if (document.querySelector('#auth-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-shell" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div class="auth-hero">
        <div class="badge">Secure local access</div>
        <h1 class="auth-title" id="auth-title">Exam Hall Login</h1>
        <p class="auth-sub">Unlock the dashboard, premium center, and saved progress with a local sign-in screen. This is a lightweight gate, not a backend account system.</p>
      </div>
      <div class="auth-body">
        <div class="auth-grid">
          <input class="auth-field" id="auth-name" placeholder="Your name" autocomplete="name" />
          <input class="auth-field" id="auth-email" placeholder="Email address" autocomplete="email" />
          <input class="auth-field" id="auth-code" placeholder="Access code" autocomplete="one-time-code" inputmode="numeric" />
        </div>
        <div class="auth-row">
          <button class="btn" id="auth-unlock">Unlock</button>
          <button class="btn ghost" id="auth-demo">Demo access</button>
          <button class="btn ghost" id="auth-logout">Clear session</button>
        </div>
        <div class="auth-chipline">
          <span class="auth-chip">Dashboard</span>
          <span class="auth-chip">Learning Plan</span>
          <span class="auth-chip">Practice</span>
          <span class="auth-chip">Mock Exams</span>
          <span class="auth-chip">Analytics</span>
        </div>
        <div class="auth-note">Demo code: <strong>2025</strong>. The code is stored locally for testing only.</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function refreshOverlay() {
  ensureOverlay();
  const overlay = document.querySelector('#auth-overlay');
  if (!overlay) return;
  overlay.style.display = auth.unlocked ? 'none' : 'grid';
  const body = document.body;
  body.style.overflow = auth.unlocked ? '' : 'hidden';
}

function unlock() {
  const name = document.querySelector('#auth-name')?.value.trim() || 'Learner';
  const email = document.querySelector('#auth-email')?.value.trim() || '';
  const code = document.querySelector('#auth-code')?.value.trim() || '';
  if (!code) {
    alert('Enter the access code.');
    return;
  }
  if (code !== '2025') {
    alert('Invalid access code.');
    return;
  }
  auth = { unlocked: true, email, name };
  saveAuth(auth);
  refreshOverlay();
}

function demoAccess() {
  auth = { unlocked: true, email: 'demo@exam-hall.local', name: 'Demo User' };
  saveAuth(auth);
  refreshOverlay();
}

function clearAuth() {
  auth = { unlocked: false, email: '', name: '' };
  saveAuth(auth);
  refreshOverlay();
}

function bindAuth() {
  document.addEventListener('click', (event) => {
    if (event.target.closest('#auth-unlock')) unlock();
    if (event.target.closest('#auth-demo')) demoAccess();
    if (event.target.closest('#auth-logout')) clearAuth();
  });
}

function initAuth() {
  ensureOverlay();
  bindAuth();
  refreshOverlay();
}

initAuth();
