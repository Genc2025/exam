const app = document.getElementById('app');

const prayers = [
  { name: 'Fajr', time: '04:12' },
  { name: 'Sunrise', time: '05:37' },
  { name: 'Dhuhr', time: '12:18' },
  { name: 'Asr', time: '15:55' },
  { name: 'Maghrib', time: '18:41' },
  { name: 'Isha', time: '20:03' }
];

const cities = ['Prishtinë', 'Prizren', 'Pejë', 'Gjakovë', 'Gjilan'];
const currentCity = 'Prishtinë';
const currentPrayer = 'Dhuhr';
const nextPrayerTime = '12:18';
const countdown = '02:31:42';

app.innerHTML = `
  <div class="app-shell">
    <div class="header">
      <div>
        <div class="eyebrow">Kosovo Prayer Times</div>
        <h1>${currentCity}</h1>
      </div>
      <div class="date">Mon, 07 Aug</div>
    </div>

    <section class="hero-card">
      <div class="hero-top">
        <div>
          <div class="label">Next prayer</div>
          <div class="next-prayer">${currentPrayer}</div>
          <div class="next-time">${nextPrayerTime}</div>
        </div>
        <div class="countdown">${countdown}</div>
      </div>
      <div class="subtext">Time remaining until the next prayer</div>
    </section>

    <section class="prayer-list">
      ${prayers.map((prayer) => `
        <div class="prayer-item ${prayer.name === currentPrayer ? 'active' : ''}">
          <span>${prayer.name}</span>
          <strong>${prayer.time}</strong>
        </div>
      `).join('')}
    </section>

    <section class="city-row" aria-label="Cities">
      ${cities.map((city, index) => `
        <button class="city-pill ${index === 0 ? 'active' : ''}" type="button">${city}</button>
      `).join('')}
    </section>
  </div>
`;

const style = document.createElement('style');
style.textContent = `
  :root {
    color-scheme: dark;
    --card: rgba(255,255,255,.08);
    --text: #f8fafc;
    --muted: rgba(248,250,252,.68);
    --accent: #7c4dff;
    --accent-2: #5b30d6;
    --line: rgba(255,255,255,.10);
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    background: linear-gradient(180deg, #05060f 0%, #070818 100%);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  #app {
    min-height: 100svh;
    padding: 16px;
    display: flex;
  }

  .app-shell {
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
  }

  .eyebrow {
    font-size: 12px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 4px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .date {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }

  .hero-card,
  .prayer-list,
  .city-row {
    border: 1px solid var(--line);
    background: var(--card);
    backdrop-filter: blur(18px);
    border-radius: 24px;
    box-shadow: 0 18px 60px rgba(0,0,0,.26);
  }

  .hero-card { padding: 18px; }

  .hero-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .label {
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .next-prayer {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1;
  }

  .next-time {
    margin-top: 6px;
    font-size: 16px;
    color: var(--muted);
  }

  .countdown {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.05em;
    padding: 10px 12px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(124,77,255,.28), rgba(91,48,214,.18));
    border: 1px solid rgba(255,255,255,.10);
    align-self: center;
  }

  .subtext {
    margin-top: 14px;
    font-size: 12px;
    color: var(--muted);
  }

  .prayer-list {
    padding: 8px;
    display: grid;
    gap: 8px;
  }

  .prayer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.04);
    border: 1px solid transparent;
    font-size: 14px;
  }

  .prayer-item span { color: rgba(248,250,252,.86); }
  .prayer-item strong { font-size: 15px; }

  .prayer-item.active {
    background: linear-gradient(180deg, rgba(124,77,255,.24), rgba(91,48,214,.18));
    border-color: rgba(255,255,255,.12);
  }

  .city-row {
    padding: 10px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .city-row::-webkit-scrollbar { display: none; }

  .city-pill {
    border: 1px solid var(--line);
    background: rgba(255,255,255,.04);
    color: var(--text);
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 12px;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .city-pill.active {
    background: linear-gradient(180deg, var(--accent), var(--accent-2));
    border-color: transparent;
  }

  @media (min-width: 768px) {
    #app { padding: 28px; }
    .app-shell { max-width: 520px; }
  }
`;

document.head.appendChild(style);
