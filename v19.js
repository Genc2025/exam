/* ASCEND PREP V19 — standalone RN dashboard architecture */
function rnV19Dashboard(){
  currentExam='NCLEX-RN';
  const readiness=v16Readiness();
  const weak=v16Weak();
  const days=v16Days();
  const today=rnState.answers.filter(a=>a.day===new Date().toISOString().slice(0,10)).length;
  const domains=Object.entries(rnState.domains).sort((a,b)=>v16Pct(a[1])-v16Pct(b[1]));
  page('Overview',`<main class="r19">
    <header class="r19-top"><div><span>ASCEND PREP</span><b>NCLEX-RN</b><i>V19</i></div><button onclick="home()">⌘</button></header>
    <section class="r19-hero">
      <div class="r19-copy"><small>TODAY'S PRIORITY</small><h1>${weak}</h1><p>Target your weakest domain first.</p><button onclick="rnV16Practice('${weak}')">Start 20Q focus set <b>→</b></button></div>
      <button class="r19-score" onclick="performance()"><strong>${readiness}</strong><sup>%</sup><span>READY</span><em>${days}d</em></button>
    </section>
    <section class="r19-strip">
      <button onclick="rnV16Practice('Mixed')"><small>TODAY</small><b>${today}<i>/${rnState.dailyTarget}</i></b><span>Questions</span></button>
      <button onclick="rnV16Review()"><small>DUE</small><b>${rnState.review.length}</b><span>Smart review</span></button>
      <button onclick="performance()"><small>TOTAL</small><b>${rnState.answers.length}</b><span>Answered</span></button>
    </section>
    <section class="r19-section"><header><div><small>MASTERY MAP</small><h2>Know where you stand</h2></div><button onclick="performance()">Analytics →</button></header>
      <div class="r19-domain-grid">${domains.map(([name,d])=>`<button onclick="rnV16Practice('${name}')"><div><span>${name}</span><b>${v16Pct(d)}%</b></div><i><u style="width:${v16Pct(d)}%"></u></i><small>${d.total} attempts</small></button>`).join('')}</div>
    </section>
    <section class="r19-section r19-actions"><header><div><small>QUICK ACTIONS</small><h2>Keep momentum</h2></div><button onclick="studyPlan()">Plan →</button></header>
      <div><button onclick="rnV16Review()"><i>↻</i><span><b>Review due</b><small>${rnState.review.length} concepts</small></span></button><button onclick="rnV16Practice('Mixed')"><i>∞</i><span><b>Mixed adaptive</b><small>All domains</small></span></button></div>
    </section>
  </main>`);
}
const rnV19PreviousDashboard=dashboard;
dashboard=function(){return currentExam==='NCLEX-RN'?rnV19Dashboard():rnV19PreviousDashboard()};
const rnV19PreviousSelect=selectExam;
selectExam=function(exam){currentExam=exam;if(exam==='NCLEX-RN')return rnV19Dashboard();return rnV19PreviousSelect(exam)};
