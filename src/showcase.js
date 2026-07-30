const app = document.getElementById('app');

const styles = document.createElement('style');
styles.textContent = `
  :root {
    --bg: #070818;
    --panel: #ffffff;
    --panel-dark: #121225;
    --panel-purple: linear-gradient(180deg, #4d20cc 0%, #22105a 100%);
    --text: #111827;
    --muted: #6b7280;
    --purple: #6d4cff;
    --purple-2: #8b5cf6;
    --green: #34d399;
    --red: #f87171;
    --line: rgba(17,24,39,.10);
    --shadow: 0 22px 70px rgba(0,0,0,.42);
    --radius: 28px;
  }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    min-height: 100%;
    background:
      radial-gradient(circle at top, rgba(99,102,241,.22), transparent 25%),
      radial-gradient(circle at bottom right, rgba(168,85,247,.14), transparent 24%),
      linear-gradient(180deg, #05060f 0%, #070818 100%);
    color: #fff;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  body { padding: 26px; }

  .wrap {
    max-width: 1620px;
    margin: 0 auto;
  }

  .hero {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 18px;
    margin-bottom: 18px;
    padding: 4px 4px 10px;
  }

  .hero h1 {
    margin: 0;
    font-size: 34px;
    letter-spacing: -0.05em;
  }

  .hero p {
    margin: 6px 0 0;
    color: rgba(255,255,255,.72);
    font-size: 13px;
    line-height: 1.45;
    max-width: 820px;
  }

  .pill {
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.04);
    color: rgba(255,255,255,.86);
    font-size: 12px;
    white-space: nowrap;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(5, minmax(260px, 1fr));
    gap: 18px;
  }

  .phone {
    min-height: 650px;
    border-radius: 30px;
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow);
    border: 1px solid rgba(255,255,255,.12);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
  }

  .phone.white {
    background: linear-gradient(180deg, #fefefe 0%, #f7f7fb 100%);
    color: var(--text);
    border-color: rgba(17,24,39,.08);
  }

  .phone.dark {
    background: linear-gradient(180deg, #161423 0%, #0d1020 100%);
    color: #fff;
  }

  .phone.purple {
    background: var(--panel-purple);
    color: #fff;
  }

  .screen {
    padding: 18px 18px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .title {
    margin: 0;
    font-size: 17px;
    letter-spacing: -0.03em;
    font-weight: 800;
  }

  .bell,
  .arrow {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 15px;
    color: inherit;
    opacity: .88;
    border: 1px solid rgba(127,127,127,.14);
    background: rgba(255,255,255,.08);
  }

  .card {
    border-radius: 22px;
    background: rgba(255,255,255,.8);
    border: 1px solid rgba(17,24,39,.06);
    box-shadow: 0 14px 40px rgba(17,24,39,.06);
    padding: 14px;
  }

  .phone.dark .card,
  .phone.purple .card {
    background: rgba(255,255,255,.08);
    border-color: rgba(255,255,255,.10);
    box-shadow: none;
  }

  .welcome {
    padding: 18px;
    background: radial-gradient(circle at 22% 18%, rgba(255,255,255,.14), transparent 26%),
      linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,.06));
    min-height: 340px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .brand {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.05;
  }

  .brand small {
    display: block;
    font-size: 13px;
    font-weight: 600;
    opacity: .82;
    margin-top: 4px;
  }

  .welcome h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }

  .welcome p {
    margin: 8px 0 0;
    color: rgba(255,255,255,.80);
    line-height: 1.45;
    font-size: 13px;
  }

  .btn {
    width: 100%;
    min-height: 48px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(180deg, #7c4dff 0%, #5b30d6 100%);
    color: white;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 12px 25px rgba(91,48,214,.38);
  }

  .btn.secondary {
    background: transparent;
    border: 1px solid rgba(255,255,255,.20);
    box-shadow: none;
    margin-top: 10px;
  }

  .home-nav {
    margin-top: auto;
    background: rgba(255,255,255,.92);
    border-top: 1px solid rgba(17,24,39,.08);
    border-radius: 22px 22px 0 0;
    padding: 12px 14px 10px;
  }

  .phone.dark .home-nav,
  .phone.purple .home-nav {
    background: rgba(255,255,255,.96);
  }

  .nav {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    color: #111827;
    font-size: 11px;
    text-align: center;
  }

  .nav span {
    display: block;
    font-size: 17px;
    margin-bottom: 4px;
    color: #6b7280;
  }

  .nav .active {
    color: var(--purple);
    font-weight: 800;
  }

  .nav .active span { color: var(--purple); }

  .gauge {
    position: relative;
    width: 154px;
    height: 154px;
    margin: 8px auto 0;
    border-radius: 50%;
    background: conic-gradient(#3b82f6 0 38%, #7c3aed 38% 67%, #e5e7eb 67% 100%);
    display: grid;
    place-items: center;
  }

  .gauge::after {
    content: '';
    position: absolute;
    inset: 16px;
    border-radius: 50%;
    background: inherit;
    filter: saturate(.2);
    opacity: .16;
  }

  .gauge > div {
    position: relative;
    z-index: 1;
    width: 122px;
    height: 122px;
    border-radius: 50%;
    background: #fff;
    display: grid;
    place-items: center;
    box-shadow: inset 0 0 0 1px rgba(17,24,39,.04);
  }

  .gauge strong {
    font-size: 30px;
    color: #111827;
    letter-spacing: -0.05em;
  }

  .gauge small {
    display: block;
    text-align: center;
    color: #6b7280;
    margin-top: -2px;
    font-size: 12px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 800;
    margin: 2px 0 0;
  }

  .subtle {
    color: #6b7280;
    font-size: 12px;
    margin-top: 3px;
  }

  .row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .task {
    padding: 11px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(17,24,39,.06);
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .phone.dark .task,
  .phone.purple .task {
    background: rgba(255,255,255,.08);
    border-color: rgba(255,255,255,.10);
  }

  .task strong {
    display: block;
    font-size: 13px;
    margin-bottom: 3px;
  }

  .task small {
    display: block;
    color: #6b7280;
    font-size: 11px;
    line-height: 1.35;
  }

  .check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #dcfce7;
    color: #15803d;
    display: grid;
    place-items: center;
    font-size: 13px;
    flex: 0 0 auto;
  }

  .tabs {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .tabs span {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.55);
    color: #6b7280;
    font-size: 12px;
    white-space: nowrap;
  }

  .tabs .active {
    background: linear-gradient(180deg, #7c4dff, #5932d6);
    color: white;
  }

  .category {
    padding: 13px 0;
    border-bottom: 1px solid rgba(17,24,39,.08);
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    font-size: 13px;
  }

  .phone.dark .category,
  .phone.purple .category {
    border-bottom-color: rgba(255,255,255,.10);
  }

  .category:last-child { border-bottom: 0; }
  .category b { display:block; font-size: 13px; margin-bottom: 2px; }
  .category small { color: #6b7280; font-size: 11px; }

  .exam-card {
    background: linear-gradient(180deg, #ffffff, #f7f7fb);
    border-radius: 24px;
    padding: 16px;
    box-shadow: 0 14px 40px rgba(17,24,39,.06);
    border: 1px solid rgba(17,24,39,.06);
  }

  .phone.dark .exam-card {
    background: rgba(255,255,255,.07);
    border-color: rgba(255,255,255,.10);
    color: #fff;
    box-shadow: none;
  }

  .exam-card h3 {
    margin: 0;
    font-size: 16px;
  }

  .exam-card p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 12px;
  }

  .exam-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 18px;
    color: #6b7280;
    font-size: 12px;
  }

  .stat-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 24px;
    padding: 14px;
  }

  .chart {
    position: relative;
    height: 190px;
    margin-top: 8px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.08));
    overflow: hidden;
  }

  .line {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 26px;
    height: 120px;
    border-left: 1px solid rgba(255,255,255,.12);
    border-bottom: 1px solid rgba(255,255,255,.12);
  }

  .line::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(124,77,255,.18) 100%);
    clip-path: polygon(0 80%, 10% 76%, 20% 74%, 30% 70%, 40% 68%, 50% 60%, 60% 56%, 70% 46%, 80% 42%, 90% 34%, 100% 26%, 100% 100%, 0 100%);
  }

  .line::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(90deg, transparent 0 14%, rgba(255,255,255,.05) 14% 15%, transparent 15% 28%, rgba(255,255,255,.05) 28% 29%, transparent 29% 42%, rgba(255,255,255,.05) 42% 43%, transparent 43% 56%, rgba(255,255,255,.05) 56% 57%, transparent 57% 70%, rgba(255,255,255,.05) 70% 71%, transparent 71% 84%, rgba(255,255,255,.05) 84% 85%, transparent 85% 100%);
    opacity: .55;
  }

  .donut {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: conic-gradient(#8b5cf6 0 64%, #22d3ee 64% 82%, #fbbf24 82% 100%);
    margin-top: 10px;
    position: relative;
  }

  .donut::after {
    content: '';
    position: absolute;
    inset: 16px;
    border-radius: 50%;
    background: #111827;
  }

  .answers {
    display: grid;
    gap: 8px;
    margin-top: 14px;
  }

  .answer {
    padding: 12px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.96);
    border: 1px solid rgba(17,24,39,.06);
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    font-size: 13px;
  }

  .answer.good { background: #dcfce7; border-color: #bbf7d0; }
  .answer.bad { background: #fee2e2; border-color: #fecaca; }

  .flash {
    background: #f8fafc;
    border-radius: 24px;
    padding: 18px;
    min-height: 320px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(17,24,39,.06);
  }

  .flip-card {
    width: 100%;
    min-height: 240px;
    perspective: 1100px;
  }

  .flip-inner {
    width: 100%;
    min-height: 240px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform .65s ease;
  }

  .flip-card.flipped .flip-inner { transform: rotateY(180deg); }

  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 24px;
    background: #fff;
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
    box-shadow: 0 14px 40px rgba(17,24,39,.06);
  }

  .face.back { transform: rotateY(180deg); }
  .face h3 { margin: 0; font-size: 18px; color: #111827; }
  .face p { margin: 12px 0 0; color: #6b7280; line-height: 1.55; }

  .footer-note {
    margin-top: 18px;
    color: rgba(255,255,255,.66);
    font-size: 12px;
    text-align: center;
  }

  @media (max-width: 1500px) { .gallery { grid-template-columns: repeat(4, minmax(240px, 1fr)); } }
  @media (max-width: 1240px) { .gallery { grid-template-columns: repeat(3, minmax(240px, 1fr)); } }
  @media (max-width: 900px) {
    body { padding: 14px; }
    .gallery { grid-template-columns: 1fr; }
    .phone { min-height: 600px; }
    .hero { display: block; }
    .hero .pill { display: inline-block; margin-top: 12px; }
  }
`;
document.head.appendChild(styles);

app.innerHTML = `
  <div class="wrap">
    <div class="hero">
      <div>
        <h1>Exam Hall UI</h1>
        <p>Clean layout inspired by the photo: a polished left welcome panel, dashboard gauge, learning plan, practice, mock exams, results, analytics, review, and flashcards.</p>
      </div>
      <div class="pill">GitHub-ready showcase</div>
    </div>

    <div class="gallery">
      <section class="phone purple">
        <div class="screen welcome">
          <div>
            <div class="brand">PMI.<small>Study Hall</small></div>
          </div>
          <div>
            <h2>Welcome back,</h2>
            <p>Let’s keep your momentum going.</p>
          </div>
          <div>
            <button class="btn">Continue Learning</button>
            <button class="btn secondary">Browse all Practice</button>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div class="active"><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone white">
        <div class="screen">
          <div class="topline"><h2 class="title">Dashboard</h2><div class="bell">🔔</div></div>
          <div class="card" style="padding-bottom:18px;">
            <div class="section-title">Exam Readiness</div>
            <div class="gauge"><div><strong>67%</strong><small>Proficient</small></div></div>
          </div>
          <div>
            <div class="section-title">Continue your last practice</div>
            <div class="card" style="margin-top:10px;">
              <div class="row" style="justify-content:space-between;">
                <div>
                  <div style="font-weight:800; font-size:13px;">Mini Exam 3</div>
                  <div class="subtle">15 / 30 Questions</div>
                </div>
                <button class="btn" style="width:auto; min-height:34px; padding:0 14px; border-radius:10px;">Continue</button>
              </div>
            </div>
          </div>
          <div>
            <div class="section-title">Recommendations</div>
            <div class="row" style="margin-top:10px;">
              <div class="card" style="flex:1; padding:12px; display:flex; align-items:center; gap:10px;">
                <div class="bell">▣</div>
                <div><div style="font-weight:800; font-size:13px;">Review weak areas</div><div class="subtle">2 tasks</div></div>
              </div>
            </div>
            <div class="row" style="margin-top:10px;">
              <div class="card" style="flex:1; padding:12px; display:flex; align-items:center; gap:10px;">
                <div class="bell">▣</div>
                <div><div style="font-weight:800; font-size:13px;">Take a full-length practice</div><div class="subtle">4 Mock Exams</div></div>
              </div>
            </div>
            <div class="row" style="margin-top:10px;">
              <div class="card" style="flex:1; padding:12px; display:flex; align-items:center; gap:10px;">
                <div class="bell">▣</div>
                <div><div style="font-weight:800; font-size:13px;">Study plan</div><div class="subtle">Next study: Communications</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div class="active"><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone white">
        <div class="screen">
          <div class="topline"><h2 class="title">Learning Plan</h2><div class="bell">🔔</div></div>
          <div class="tabs"><span>Mon</span><span>Tue</span><span class="active">Wed 22</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          <div class="card">
            <div class="section-title">Today’s Plan</div>
            <div class="subtle">3 / 5 tasks completed</div>
            <div style="height:8px; border-radius:999px; background:#e5e7eb; overflow:hidden; margin-top:12px;"><div style="width:62%; height:100%; background:linear-gradient(90deg, #7c4dff, #22d3ee);"></div></div>
          </div>
          <div class="task"><div><strong>Study: Project Integration</strong><small>15 mins</small></div><div class="check">✓</div></div>
          <div class="task"><div><strong>Practice: 10 Questions</strong><small>Project Scope · 10 mins</small></div><div class="check">✓</div></div>
          <div class="task"><div><strong>Review: Incorrect Answers</strong><small>Mini Exam 2 · 15 mins</small></div><div style="width:22px;height:22px;border-radius:50%;border:2px solid #d1d5db;"></div></div>
          <div class="task"><div><strong>Flashcards: Key Terms</strong><small>20 mins</small></div><div style="width:22px;height:22px;border-radius:50%;border:2px solid #d1d5db;"></div></div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div class="active"><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone white">
        <div class="screen">
          <div class="topline"><h2 class="title">Practice</h2><div class="arrow">→</div></div>
          <div class="tabs"><span class="active">Practice Questions</span><span>Mock Exams</span><span>Mini Exams</span></div>
          <div class="card">
            <div class="section-title">Question of the Day</div>
            <div class="subtle">Test your knowledge daily</div>
            <div style="float:right; margin-top:-28px; width:38px; height:38px; border-radius:12px; background:rgba(124,77,255,.10); display:grid; place-items:center; color:var(--purple);">📅</div>
          </div>
          <div>
            <div class="section-title">Categories</div>
            <div class="category"><div><b>Project Integration</b><small>15% of exam</small></div><div>›</div></div>
            <div class="category"><div><b>Scope</b><small>15% of exam</small></div><div>›</div></div>
            <div class="category"><div><b>Schedule</b><small>15% of exam</small></div><div>›</div></div>
            <div class="category"><div><b>Cost</b><small>10% of exam</small></div><div>›</div></div>
            <div class="category"><div><b>Quality</b><small>8% of exam</small></div><div>›</div></div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div class="active"><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone white">
        <div class="screen">
          <div class="topline"><h2 class="title">Mock Exams</h2><div></div></div>
          <div class="exam-card">
            <div class="section-title">Full-Length Mock Exam</div>
            <p>Simulate the real exam experience</p>
            <div class="exam-meta"><span>175 Questions</span><span>4 Hours</span></div>
            <button class="btn" style="margin-top:14px;">Start Exam</button>
          </div>
          <div>
            <div class="section-title">Your Mock Exams</div>
            <div class="task" style="margin-top:10px;"><div><strong>Mock Exam 1</strong><small>Completed on May 20, 2024</small></div><strong>65%</strong></div>
            <div class="task" style="margin-top:10px;"><div><strong>Mock Exam 2</strong><small>Completed on May 15, 2024</small></div><strong>72%</strong></div>
            <div class="task" style="margin-top:10px;"><div><strong>Mock Exam 3</strong><small>15 / 175 Questions</small></div><strong>In Progress</strong></div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div class="active"><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone dark">
        <div class="screen">
          <div class="topline"><h2 class="title">Practice Questions</h2><div class="pill" style="background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.10);">8 of 10</div></div>
          <div class="card" style="background:rgba(255,255,255,.04); color:#fff;">
            <div class="pill" style="display:inline-block; background:rgba(52,211,153,.16); color:#a7f3d0; border:0; padding:6px 10px;">Easy</div>
            <p style="margin-top:12px; color:#e5e7eb; line-height:1.55; font-size:14px;">A project manager is developing the project charter. Which of the following should the project manager do first?</p>
          </div>
          <div class="answers">
            <div class="answer"><span>A</span><span>Meet with the project sponsor</span></div>
            <div class="answer"><span>B</span><span>Conduct a risk assessment</span></div>
            <div class="answer"><span>C</span><span>Identify the project stakeholders</span></div>
            <div class="answer good"><span>D</span><span>Develop the project management plan</span></div>
          </div>
          <div class="card" style="background:rgba(255,255,255,.04); color:#fff; margin-top:auto;">
            <div class="section-title" style="color:#fff;">Correct Answer</div>
            <p style="color:#cbd5e1; margin-top:8px;">The project management plan is developed after the project charter is approved.</p>
            <div class="row" style="margin-top:12px;">
              <button class="btn secondary" style="flex:1; margin-top:0;">Explanation</button>
              <button class="btn" style="flex:1; margin-top:0;">Next Question</button>
            </div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div class="active"><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone dark">
        <div class="screen">
          <div class="topline"><h2 class="title">Results</h2><div class="bell">🔔</div></div>
          <div class="card" style="text-align:center; color:#fff; padding:18px 16px; background:rgba(255,255,255,.05);">
            <div class="subtle" style="color:#cbd5e1;">Mock Exam 1</div>
            <div class="pill" style="margin-top:8px; display:inline-block; background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12);">Completed on May 20, 2024</div>
            <div style="font-size:58px; font-weight:900; letter-spacing:-.06em; margin-top:8px;">65%</div>
            <div style="font-size:18px; font-weight:800;">Proficient</div>
            <p style="color:#cbd5e1;">You have met the proficiency target!</p>
          </div>
          <div>
            <div class="section-title" style="color:#fff;">Performance by Domain</div>
            <div style="margin-top:12px; display:grid; gap:10px;">
              <div><div class="row" style="justify-content:space-between; color:#fff; font-size:12px;"><span>Project Integration</span><span>70%</span></div><div style="height:8px; background:rgba(255,255,255,.08); border-radius:999px; margin-top:6px;"><div style="width:70%; height:100%; border-radius:999px; background:linear-gradient(90deg,#7c4dff,#ec4899);"></div></div></div>
              <div><div class="row" style="justify-content:space-between; color:#fff; font-size:12px;"><span>Scope</span><span>60%</span></div><div style="height:8px; background:rgba(255,255,255,.08); border-radius:999px; margin-top:6px;"><div style="width:60%; height:100%; border-radius:999px; background:linear-gradient(90deg,#7c4dff,#22d3ee);"></div></div></div>
              <div><div class="row" style="justify-content:space-between; color:#fff; font-size:12px;"><span>Schedule</span><span>55%</span></div><div style="height:8px; background:rgba(255,255,255,.08); border-radius:999px; margin-top:6px;"><div style="width:55%; height:100%; border-radius:999px; background:linear-gradient(90deg,#f59e0b,#7c4dff);"></div></div></div>
              <div><div class="row" style="justify-content:space-between; color:#fff; font-size:12px;"><span>Cost</span><span>75%</span></div><div style="height:8px; background:rgba(255,255,255,.08); border-radius:999px; margin-top:6px;"><div style="width:75%; height:100%; border-radius:999px; background:linear-gradient(90deg,#22d3ee,#7c4dff);"></div></div></div>
              <div><div class="row" style="justify-content:space-between; color:#fff; font-size:12px;"><span>Quality</span><span>80%</span></div><div style="height:8px; background:rgba(255,255,255,.08); border-radius:999px; margin-top:6px;"><div style="width:80%; height:100%; border-radius:999px; background:linear-gradient(90deg,#34d399,#7c4dff);"></div></div></div>
            </div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div class="active"><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone dark">
        <div class="screen">
          <div class="topline"><h2 class="title">Performance Overview</h2><div></div></div>
          <div class="stat-card">
            <div class="subtle" style="color:#cbd5e1;">Overall Performance</div>
            <div style="display:flex; justify-content:space-between; align-items:end; gap:10px; margin-top:8px;">
              <div>
                <div style="font-size:52px; font-weight:900; letter-spacing:-.06em; line-height:1;">65%</div>
                <div style="color:#cbd5e1; font-size:13px;">Proficient</div>
              </div>
              <div class="pill" style="background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12);">65%</div>
            </div>
            <div class="chart"><div class="line"></div></div>
          </div>
          <div class="stat-card">
            <div class="row" style="justify-content:space-between; align-items:center; color:#fff;">
              <div>
                <div style="font-size:13px; font-weight:800;">by Practice Type</div>
                <div class="subtle" style="color:#cbd5e1;">Mock Exams · Mini Exams · Practice Questions</div>
              </div>
              <div class="donut"></div>
            </div>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div class="active"><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone dark">
        <div class="screen">
          <div class="topline"><h2 class="title">Review Answers</h2><div class="arrow">↔</div></div>
          <div class="card" style="background:rgba(255,255,255,.05); color:#fff;">
            <div class="row" style="justify-content:space-between; align-items:center;">
              <div class="pill" style="background:rgba(250,204,21,.15); border:0; color:#fde68a;">Medium</div>
              <div class="pill" style="background:rgba(248,113,113,.14); border:0; color:#fecaca;">Incorrect</div>
            </div>
            <p style="color:#e5e7eb; margin-top:12px;">A project manager is managing a hybrid project. What is the primary benefit of using a hybrid approach?</p>
          </div>
          <div class="answers">
            <div class="answer"><span>A</span><span>Increased risk</span></div>
            <div class="answer bad"><span>B</span><span>Flexibility and responsiveness</span><span>✕</span></div>
            <div class="answer"><span>C</span><span>Higher cost</span></div>
            <div class="answer"><span>D</span><span>More documentation</span></div>
          </div>
          <div class="card" style="background:rgba(255,255,255,.05); color:#fff; margin-top:auto;">
            <div class="section-title" style="color:#fff;">Correct Answer</div>
            <p style="color:#cbd5e1; margin-top:8px;">A hybrid approach allows the project team to be flexible and responsive to changes.</p>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div class="active"><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div><span>⋯</span>More</div>
          </div>
        </div>
      </section>

      <section class="phone dark">
        <div class="screen">
          <div class="topline"><h2 class="title">Flashcards</h2><div></div></div>
          <div class="flash">
            <div class="flip-card" id="flashcard">
              <div class="flip-inner">
                <div class="face front">
                  <div>
                    <h3>What is the purpose of the Work Breakdown Structure (WBS)?</h3>
                    <p>Tap to show the answer.</p>
                  </div>
                </div>
                <div class="face back">
                  <div>
                    <h3>To organize and define the total scope of the project.</h3>
                    <p>It breaks the project into manageable deliverables and work packages.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row" style="gap:10px; margin-top:10px;">
            <button class="btn secondary" style="flex:1; margin-top:0;" id="flipBtn">Explanation</button>
            <button class="btn" style="flex:1; margin-top:0;">Show Answer</button>
          </div>
        </div>
        <div class="home-nav">
          <div class="nav">
            <div><span>⌂</span>Home</div>
            <div><span>◫</span>Practice</div>
            <div><span>▦</span>Plan</div>
            <div><span>▤</span>Reports</div>
            <div class="active"><span>⋯</span>More</div>
          </div>
        </div>
      </section>
    </div>

    <div class="footer-note">Built to match the structure and feel of the reference, with original content and implementation.</div>
  </div>
`;

const card = document.getElementById('flashcard');
const flipBtn = document.getElementById('flipBtn');
if (card) card.addEventListener('click', () => card.classList.toggle('flipped'));
if (flipBtn && card) flipBtn.addEventListener('click', () => card.classList.toggle('flipped'));
