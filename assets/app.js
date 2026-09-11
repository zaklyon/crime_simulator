document.addEventListener('DOMContentLoaded',()=>{
  const inGuide=location.pathname.includes('/guides/');
  const root=inGuide?'../':'./';
  const page=document.body.dataset.page||'home';
  const guide=f=>root+'guides/'+f;

  if(!document.querySelector('link[href*="v4.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'assets/v4.css';document.head.appendChild(l);}
  if(!document.querySelector('link[href*="hideout.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'assets/hideout.css';document.head.appendChild(l);}
  if(!document.querySelector('script[src*="v4.js"]')){const s=document.createElement('script');s.src=root+'assets/v4.js';document.body.appendChild(s);}

  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link'); manifest.rel='manifest'; manifest.href=root+'manifest.webmanifest'; document.head.appendChild(manifest);
    const icon=document.createElement('link'); icon.rel='icon'; icon.href=root+'assets/icon.svg'; icon.type='image/svg+xml'; document.head.appendChild(icon);
    const theme=document.createElement('meta'); theme.name='theme-color'; theme.content='#090b0c'; document.head.appendChild(theme);
  }
  if('serviceWorker' in navigator){ navigator.serviceWorker.register(root+'sw.js').catch(()=>{}); }

  const brand=document.querySelector('.brand');
  if(brand){
    const mark=brand.querySelector('.brand-mark');if(mark)mark.textContent='H';
    const text=[...brand.children].find(x=>x.tagName==='SPAN'&&!x.classList.contains('brand-mark'));
    if(text)text.innerHTML='THE HIDEOUT<small>Crime Simulator Crew Companion</small>';
  }

  const sidebar=document.querySelector('.sidebar');
  if(sidebar){
    sidebar.innerHTML=`
      <h4>QG</h4><nav><a data-nav="home" href="${root}">Accueil</a><a data-nav="crew" href="${root}crew.html">Ce soir</a></nav>
      <h4>Missions</h4><nav><a data-nav="heists" href="${guide('heists.html')}">Braquages</a><a data-nav="maps" href="${guide('maps.html')}">Cartes & maisons</a><a data-nav="vehicles" href="${guide('vehicles.html')}">Véhicules</a></nav>
      <h4>Progression</h4><nav><a data-nav="progression" href="${guide('progression.html')}">Progression</a><a data-nav="xp" href="${guide('xp-fast.html')}">XP rapide</a><a data-nav="skills" href="${guide('skills.html')}">Compétences</a><a data-nav="furniture" href="${guide('furniture.html')}">Meubles & unlocks</a><a data-nav="achievements" href="${guide('achievements.html')}">65 succès</a></nav>
      <h4>Intel</h4><nav><a data-nav="vip" href="${guide('vip-items.html')}">Objets VIP</a><a data-nav="vouchers" href="${guide('vouchers.html')}">Vouchers</a><a data-nav="cards" href="${guide('golden-cards.html')}">Golden Cards</a><a data-nav="tools" href="${guide('tools.html')}">Outils & loadout</a><a data-nav="chemistry" href="${guide('chemistry.html')}">Chimie</a><a data-nav="secrets" href="${guide('secrets.html')}">Secrets & techniques</a><a data-nav="fast" href="${guide('fast-techs.html')}">Fast Techs & Bugs</a></nav>
      <div class="sep"></div><nav><a href="https://github.com/zaklyon/crime_simulator">Source / contribuer ↗</a></nav>`;
  }

  const top=document.querySelector('.toplinks');
  if(top){
    const missionPages=['heists','maps','vehicles'];
    const progressionPages=['progression','xp','skills','furniture','achievements'];
    const intelPages=['vip','vouchers','cards','tools','chemistry','secrets','fast'];
    top.innerHTML=`<a ${page==='home'?'class="active"':''} href="${root}">QG</a><a ${page==='crew'?'class="active"':''} href="${root}crew.html">Ce soir</a><a ${missionPages.includes(page)?'class="active"':''} href="${guide('heists.html')}">Missions</a><a ${progressionPages.includes(page)?'class="active"':''} href="${guide('xp-fast.html')}">Progression</a><a ${intelPages.includes(page)?'class="active"':''} href="${guide('maps.html')}">Intel</a>`;
  }

  const search=document.querySelector('[data-table-search]');
  if(search){
    const selector=search.dataset.tableSearch;
    const rows=[...document.querySelectorAll(selector+' tbody tr')];
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase();
      rows.forEach(row=>row.classList.toggle('hidden',q && !row.innerText.toLowerCase().includes(q)));
    });
  }

  document.querySelectorAll('[data-checklist]').forEach(box=>{
    const key='crime-wiki:'+box.dataset.checklist;
    box.checked=localStorage.getItem(key)==='1';
    box.addEventListener('change',()=>{
      localStorage.setItem(key,box.checked?'1':'0');
      updateAchievementProgress(); updateLocalChecklistPanel();
    });
  });

  document.querySelectorAll('[data-nav]').forEach(a=>{ if(a.dataset.nav===page)a.classList.add('current'); });

  const bar=document.querySelector('.sitebar-inner');
  if(sidebar && bar){
    const mobile=document.createElement('button'); mobile.className='mobile-menu'; mobile.type='button'; mobile.setAttribute('aria-label','Ouvrir le menu'); mobile.innerHTML='<span></span><span></span><span></span>';
    bar.insertBefore(mobile,bar.firstChild);
    const shade=document.createElement('div'); shade.className='nav-shade'; document.body.appendChild(shade);
    const close=()=>document.body.classList.remove('nav-open');
    mobile.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
    shade.addEventListener('click',close); sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  }

  const index=[
    ['QG The Hideout','Dashboard crew, mission selector et accès rapide','', 'home accueil crew qg hideout'],
    ['Ce soir','Objectif, tâches du crew, presets et plan Discord','crew.html','crew task todo ce soir plan discord objectif'],
    ['Progression','Quota, crédits, ordre d’achat et inventaire','guides/progression.html','quota credits slots début'],
    ['XP & Leveling rapide','Reader, Bookstand, téléphones, jobs, requests et farm','guides/xp-fast.html','xp level leveling farm reader bookstand telephone payphone jobs requests challenges'],
    ['Compétences','Les 25 skills et leurs priorités','guides/skills.html','skills reader strongman perception interrogator'],
    ['Golden Cards','Les 24 cartes, effets et combinaisons','guides/golden-cards.html','cards blind deadline diamond silent xp'],
    ['Outils & loadout','Lockpick, hack, stun, scanner et équipement','guides/tools.html','outils lockpick bobby pin remote hack stun gun scanner loadout'],
    ['Meubles & unlocks','Catalogue, déblocages et tracker des meubles verrouillés','guides/furniture.html','furniture meubles tapis treadmill bookstand bench voucher gold stack unlock locked'],
    ['Vouchers','Random Gift, Special Ability et Voucher Machine','guides/vouchers.html','voucher random gift special ability ability machine'],
    ['Cartes & maisons','Rural, Lakeside, Texas, Arizona et Ashen Creek','guides/maps.html','maps houses 101 103 208 209 211 212 301 302 304'],
    ['Objets VIP','Tracker des VIP connus par cible','guides/vip-items.html','vip items gaming pc tv coffre scooter'],
    ['Braquages','Texas Train Station et AI Research Center','guides/heists.html','heist braquage texas train ai research robots H1'],
    ['Véhicules','Door Drill, hotwire, réparation et vente','guides/vehicles.html','cars voiture hotwire drill trunkload'],
    ['Chimie','Compact Lab et recettes 100 %','guides/chemistry.html','chemistry chimie viper omega breaking bad'],
    ['Secrets & techniques','Raccourcis, coffre, fenêtres, police et extraction','guides/secrets.html','tips secrets coffre safe glass knife police'],
    ['Fast Techs & Bugs','Cheese, routes rapides, exploits suivis et statut des patches','guides/fast-techs.html','fast tech bug exploit glitch cheese terminal diamond ladder candy bowl gas chain'],
    ['65 succès','Checklist Steam complète','guides/achievements.html','achievements success steam 100 completionist'],
  ];
  const searchBtn=document.createElement('button'); searchBtn.className='global-search-btn'; searchBtn.type='button'; searchBtn.innerHTML='<span class="search-icon">⌕</span><span>Search intel</span><kbd>Ctrl K</kbd>';
  if(top) top.insertAdjacentElement('beforebegin',searchBtn);
  const modal=document.createElement('div'); modal.className='command-backdrop'; modal.innerHTML=`<div class="command" role="dialog" aria-modal="true"><div class="command-input"><span>⌕</span><input autocomplete="off" spellcheck="false" placeholder="Maison, VIP, unlock, braquage, objet…"><kbd>Esc</kbd></div><div class="command-results"></div><div class="command-foot"><span>↵ ouvrir</span><span>↑ ↓ naviguer</span><span>THE HIDEOUT SEARCH</span></div></div>`; document.body.appendChild(modal);
  const input=modal.querySelector('input'), results=modal.querySelector('.command-results'); let active=0, current=[];
  const resolve=u=>u?root+u:root;
  const render=(q='')=>{
    const terms=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    current=index.filter(x=>terms.every(t=>(x[0]+' '+x[1]+' '+x[3]).toLowerCase().includes(t))).slice(0,9); active=0;
    results.innerHTML=current.length?current.map((x,i)=>`<a class="command-result ${i===0?'selected':''}" href="${resolve(x[2])}" data-i="${i}"><span class="command-dot"></span><span><b>${x[0]}</b><small>${x[1]}</small></span><span class="command-go">↗</span></a>`).join(''):'<div class="command-empty">Aucun résultat. Essaie “209”, “XP”, “VIP”, “Texas”, “Powerlifting” ou “bug”.</div>';
  };
  const select=n=>{ if(!current.length)return; active=(n+current.length)%current.length; results.querySelectorAll('.command-result').forEach((el,i)=>el.classList.toggle('selected',i===active)); results.querySelector('.selected')?.scrollIntoView({block:'nearest'}); };
  const openSearch=()=>{modal.classList.add('open');render();setTimeout(()=>input.focus(),30)};
  const closeSearch=()=>modal.classList.remove('open');
  searchBtn.addEventListener('click',openSearch); modal.addEventListener('click',e=>{if(e.target===modal)closeSearch()}); input.addEventListener('input',()=>render(input.value));
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();select(active+1)}if(e.key==='ArrowUp'){e.preventDefault();select(active-1)}if(e.key==='Enter'&&current[active]) location.href=resolve(current[active][2]);});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();modal.classList.contains('open')?closeSearch():openSearch()}if(e.key==='Escape'){closeSearch();document.body.classList.remove('nav-open')}});

  if(page!=='home'){
    const title=document.querySelector('h1')?.textContent?.trim()||document.title;
    const file=location.pathname.split('/').pop();
    localStorage.setItem('crime-wiki:last',JSON.stringify({title,href:inGuide?'guides/'+file:file,time:Date.now()}));
  } else {
    const holder=document.getElementById('continueCard');
    try{const last=JSON.parse(localStorage.getItem('crime-wiki:last'));if(holder&&last){holder.hidden=false;holder.querySelector('b').textContent=last.title;holder.querySelector('a').href=last.href||'#';}}catch(e){}
  }

  function achievementDone(){let done=0;for(let i=1;i<=65;i++){if(localStorage.getItem('crime-wiki:a'+String(i).padStart(2,'0'))==='1')done++;}return done;}
  function updateAchievementProgress(){
    const done=achievementDone();
    document.querySelectorAll('[data-ach-progress]').forEach(el=>el.textContent=done+'/65');
    document.querySelectorAll('[data-ach-bar]').forEach(el=>el.style.width=(done/65*100)+'%');
  }
  function updateLocalChecklistPanel(){
    const panel=document.querySelector('[data-local-check-progress]'); if(!panel)return;
    const boxes=[...document.querySelectorAll('[data-checklist]')], done=boxes.filter(x=>x.checked).length;
    panel.querySelector('b').textContent=done+' / '+boxes.length;
    panel.querySelector('i').style.width=(boxes.length?done/boxes.length*100:0)+'%';
  }
  updateAchievementProgress();

  if((page==='achievements'||page==='vip') && document.querySelector('.page-head')){
    const label=page==='achievements'?'Progression succès':'VIP cochés';
    const p=document.createElement('div');p.className='check-progress';p.dataset.localCheckProgress='';p.innerHTML=`<span>${label}</span><b>0 / 0</b><div class="progress-track"><i></i></div>`;
    document.querySelector('.page-head').appendChild(p); updateLocalChecklistPanel();
  }

  const target=document.getElementById('plannerTarget'), planner=document.getElementById('plannerResult');
  if(target&&planner){
    const plans={
      house:{title:'Maison / cambriolage classique',risk:'Faible → moyen',tools:['Bobby Pin','Glass Knife','Remote Hack Tool','Zip Ties'],skills:['Advanced Lockpicking','Basic Electronics','Perception'],tip:'Entre par la route la plus silencieuse, repère le lourd et rapproche-le de la sortie avant la fin.'},
      lakeside:{title:'Lakeside / VIP & cartes',risk:'Moyen',tools:['Bobby Pin','Glass Knife','Stethoscope','Scanner'],skills:['Perception III','Interrogator','Stealth II'],tip:'209 et 211 concentrent plusieurs systèmes. Fouille les coffres et garde un œil sur les objets VIP.'},
      texas:{title:'Texas Train Station',risk:'Élevé',tools:['Master Key / Master Lockpicking','Remote Hack','Thermal Goggles','Stun Gun','Zip Ties'],skills:['Master Lockpicking','Advanced Electronics','Stealth II'],tip:'Sécurité d’abord : poste de garde, codes, alarmes, tripwires, lasers et caméras. Le lourd vient après.'},
      ai:{title:'AI Research Center',risk:'Très élevé',tools:['Thermal Goggles','Stun Gun','Zip Ties','Crossbow + Sleep Darts','Scanner'],skills:['Stealth II','Perception III','Advanced Electronics'],tip:'Isole les robots. Contrôle une patrouille avant d’entrer profondément et ne compte pas sur le pistolet pour les supprimer.'},
      car:{title:'Vol de voiture',risk:'Moyen → élevé',tools:['Car Door Drill','Car Toolbox','Essence','Slots libres'],skills:['Car Theft','Agility'],tip:'Prépare réparation + carburant avant la vente. Pour Trunkload, charge 10 000 $ de loot dans un véhicule compatible.'},
      vip:{title:'Chasse aux VIP',risk:'Moyen',tools:['Scanner','Thermal Goggles','Bobby Pin','Stethoscope'],skills:['Perception III','Agility II','Stealth II'],tip:'Lakeside puis Rural Arizona donnent une bonne densité. Utilise le tracker VIP pendant ta run.'}
    };
    const draw=()=>{const p=plans[target.value];planner.innerHTML=`<div class="planner-head"><span>Briefing recommandé</span><b>${p.title}</b><em>Risque : ${p.risk}</em></div><div class="planner-columns"><div><small>LOADOUT</small>${p.tools.map(x=>`<span>${x}</span>`).join('')}</div><div><small>COMPÉTENCES</small>${p.skills.map(x=>`<span>${x}</span>`).join('')}</div></div><p>${p.tip}</p>`;};
    target.addEventListener('change',draw); draw();
  }

  if(page!=='home'){
    const head=document.querySelector('.page-head');
    if(head){const actions=document.createElement('div');actions.className='page-actions';actions.innerHTML='<button type="button" class="copy-link">⛓ Copier le lien</button><span class="verified-chip">HIDEOUT MODULE</span>';head.appendChild(actions);actions.querySelector('button').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.currentTarget.textContent='✓ Lien copié';setTimeout(()=>e.currentTarget.textContent='⛓ Copier le lien',1300)}catch(_){}});}
  }

  let installEvent=null;
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault(); installEvent=e;
    const btn=document.createElement('button');btn.className='install-btn';btn.type='button';btn.textContent='＋ Installer The Hideout';
    const host=document.querySelector('.sitebar-inner'); if(host){host.appendChild(btn);btn.addEventListener('click',async()=>{if(!installEvent)return;installEvent.prompt();await installEvent.userChoice;installEvent=null;btn.remove();});}
  });
});