const MirandaUI={
  mealLabel(){const h=new Date().getHours();return h<11?'Mëngjesi':h<16?'Dreka':'Darka'},
  todayCard(){const p=typeof MirandaCore!=='undefined'?MirandaCore.profile():null;const name=p?.name||'ti';return `<section class="today-for-you"><small>SOT PËR ${String(name).toUpperCase()}</small><h3>${this.mealLabel()} pa komplikime.</h3><p>Zgjidh ushqimin, regjistro vaktin ose vazhdo me aktivitetin pa dalë nga pamja kryesore.</p><div class="today-actions"><button onclick="openDiet()">Receta</button><button onclick="Nutrition.show()">Ushqimi</button><button onclick="${p?.type==='adult'?'FitnessPro.open()':'Family.show()'}">${p?.type==='adult'?'Fitness':'Profili'}</button></div></section>`},
  injectToday(){const root=document.querySelector('.mu');if(!root||root.querySelector('.today-for-you'))return;const members=root.querySelector('.mu-members');if(members)members.insertAdjacentHTML('afterend',this.todayCard())},
  normalizeNav(){const nav=document.querySelector('.mu-nav');if(!nav)return;nav.innerHTML=`<button class="active" onclick="MirandaCore.dashboard()"><i>⌂</i><span>Home</span></button><button onclick="openDiet()"><i>♧</i><span>Ushqimi</span></button><button onclick="MirandaUI.openFitness()"><i>⌁</i><span>Fitness</span></button><button onclick="Family.show()"><i>♙</i><span>Profili</span></button>`},
  refresh(){setTimeout(()=>{this.injectToday();this.normalizeNav()},40)},
  openFitness(){const p=typeof MirandaCore!=='undefined'?MirandaCore.profile():null;p?.type==='adult'?FitnessPro.open():Family.show()},
  sheet(html){this.closeSheet();document.body.insertAdjacentHTML('beforeend',`<div class="miranda-sheet" id="mirandaSheet" onclick="if(event.target===this)MirandaUI.closeSheet()"><div><button class="miranda-sheet-close" onclick="MirandaUI.closeSheet()">×</button>${html}</div></div>`)},
  closeSheet(){document.getElementById('mirandaSheet')?.remove()},
  install(){if(window.__mirandaRedesign)return;window.__mirandaRedesign=true;const original=MirandaCore.dashboard.bind(MirandaCore);MirandaCore.dashboard=function(){original();MirandaUI.refresh()};this.refresh()}
};
setTimeout(()=>MirandaUI.install(),1100);
