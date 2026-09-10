document.addEventListener('DOMContentLoaded',()=>{
  const inGuide=location.pathname.includes('/guides/');
  const root=inGuide?'../':'./';
  const page=document.body.dataset.page||'home';

  // PWA metadata + favicon on every static page.
  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link'); manifest.rel='manifest'; manifest.href=root+'manifest.webmanifest'; document.head.appendChild(manifest);
    const icon=document.createElement('link'); icon.rel='icon'; icon.href=root+'assets/icon.svg'; icon.type='image/svg+xml'; document.head.appendChild(icon);
    const theme=document.createElement('meta'); theme.name='theme-color'; theme.content='#101113'; document.head.appendChild(theme);
  }
  if('serviceWorker' in navigator){ navigator.serviceWorker.register(root+'sw.js').catch(()=>{}); }

  // Local table filtering.
  const search=document.querySelector('[data-table-search]');
  if(search){
    const selector=search.dataset.tableSearch;
    const rows=[...document.querySelectorAll(selector+' tbody tr')];
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLowerCase();
      rows.forEach(row=>row.classList.toggle('hidden',q && !row.innerText.toLowerCase().includes(q)));
    });
  }

  // Persistent checklists.
  document.querySelectorAll('[data-checklist]').forEach(box=>{
    const key='crime-wiki:'+box.dataset.checklist;
    box.checked=localStorage.getItem(key)==='1';
    box.addEventListener('change',()=>{
      localStorage.setItem(key,box.checked?'1':'0');
      updateAchievementProgress();
    });
  });

  // Extend the static sidebar without duplicating markup across every page.
  const addNavAfter=(selector,id,label,guideFile)=>{
    const anchor=document.querySelector(selector);
    if(anchor && !document.querySelector(`[data-nav="${id}"]`)){
      const a=document.createElement('a'); a.dataset.nav=id; a.textContent=label; a.href=inGuide?guideFile:'guides/'+guideFile;
      anchor.insertAdjacentElement('afterend',a);
    }
  };
  addNavAfter('[data-nav="tools"]','furniture','Meubles','furniture.html');
  addNavAfter('[data-nav="furniture"]','vouchers','Vouchers','vouchers.html');
  addNavAfter('[data-nav="maps"]','vip','Objets VIP','vip-items.html');
  addNavAfter('[data-nav="vip"]','heists','Braquages','heists.html');
  document.querySelectorAll('[data-nav]').forEach(a=>{ if(a.dataset.nav===page)a.classList.add('current'); });

  // Mobile drawer.
  const sidebar=document.querySelector('.sidebar');
  const bar=document.querySelector('.sitebar-inner');
  if(sidebar && bar){
    const mobile=document.createElement('button'); mobile.className='mobile-menu'; mobile.type='button'; mobile.setAttribute('aria-label','Ouvrir le menu'); mobile.innerHTML='<span></span><span></span><span></span>';
    bar.insertBefore(mobile,bar.firstChild);
    const shade=document.createElement('div'); shade.className='nav-shade'; document.body.appendChild(shade);
    const close=()=>document.body.classList.remove('nav-open');
    mobile.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
    shade.addEventListener('click',close); sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  }

  // Global command/search palette.
  const index=[
    ['Accueil','Vue générale, préparateur de sortie et accès rapide','', 'home démarrage'],
    ['Progression','Quota, crédits, ordre d’achat et inventaire','guides/progression.html','quota credits slots début'],
    ['Compétences','Les 25 skills et leurs priorités','guides/skills.html','skills reader strongman perception interrogator'],
    ['Golden Cards','Les 24 cartes, effets et combinaisons','guides/golden-cards.html','cards blind deadline diamond silent xp'],
    ['Outils & planque','Lockpick, hack, stun, scanner et équipement','guides/tools.html','outils lockpick bobby pin remote hack stun gun scanner'],
    ['Meubles','Catalogue des meubles, effets et conditions','guides/furniture.html','furniture tapis course treadmill bookstand bench voucher machine gold stack'],
    ['Vouchers','Random Gift, Special Ability et Voucher Machine','guides/vouchers.html','voucher random gift special ability ability machine'],
    ['Cartes & maisons','Rural, Lakeside, Texas, Arizona et Ashen Creek','guides/maps.html','maps houses 101 103 208 209 211 212 301 302 304'],
    ['Objets VIP','Tracker des VIP connus par cible','guides/vip-items.html','vip items gaming pc tv coffre scooter'],
    ['Braquages','Texas Train Station et AI Research Center','guides/heists.html','heist braquage texas train ai research robots H1'],
    ['Véhicules','Door Drill, hotwire, réparation et vente','guides/vehicles.html','cars voiture hotwire drill trunkload'],
    ['Chimie','Compact Lab et recettes 100 %','guides/chemistry.html','chemistry chimie viper omega breaking bad'],
    ['Secrets & techniques','Raccourcis, coffre, fenêtres, police et extraction','guides/secrets.html','tips secrets coffre safe glass knife police'],
    ['65 succès','Checklist Steam complète','guides/achievements.html','achievements success steam 100 completionist'],
  ];
  const searchBtn=document.createElement('button'); searchBtn.className='global-search-btn'; searchBtn.type='button'; searchBtn.innerHTML='<span class="search-icon">⌕</span><span>Rechercher</span><kbd>Ctrl K</kbd>';
  const top=document.querySelector('.toplinks'); if(top) top.insertAdjacentElement('beforebegin',searchBtn);
  const modal=document.createElement('div'); modal.className='command-backdrop'; modal.innerHTML=`<div class="command" role="dialog" aria-modal="true"><div class="command-input"><span>⌕</span><input autocomplete="off" spellcheck="false" placeholder="Compétence, maison, objet, braquage…"><kbd>Esc</kbd></div><div class="command-results"></div><div class="command-foot"><span>↵ ouvrir</span><span>↑ ↓ naviguer</span><span>Crime Wiki Search</span></div></div>`; document.body.appendChild(modal);
  const input=modal.querySelector('input'), results=modal.querySelector('.command-results'); let active=0, current=[];
  const resolve=u=>u?root+u:root;
  const render=(q='')=>{
    const terms=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    current=index.filter(x=>terms.every(t=>(x[0]+' '+x[1]+' '+x[3]).toLowerCase().includes(t))).slice(0,9); active=0;
    results.innerHTML=current.length?current.map((x,i)=>`<a class="command-result ${i===0?'selected':''}" href="${resolve(x[2])}" data-i="${i}"><span class="command-dot"></span><span><b>${x[0]}</b><small>${x[1]}</small></span><span class="command-go">↗</span></a>`).join(''):'<div class="command-empty">Aucun résultat. Essaie “209”, “voucher”, “VIP” ou “Texas”.</div>';
  };
  const select=n=>{ if(!current.length)return; active=(n+current.length)%current.length; results.querySelectorAll('.command-result').forEach((el,i)=>el.classList.toggle('selected',i===active)); results.querySelector('.selected')?.scrollIntoView({block:'nearest'}); };
  const openSearch=()=>{modal.classList.add('open');render();setTimeout(()=>input.focus(),30)};
  const closeSearch=()=>modal.classList.remove('open');
  searchBtn.addEventListener('click',openSearch); modal.addEventListener('click',e=>{if(e.target===modal)closeSearch()}); input.addEventListener('input',()=>render(input.value));
  input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();select(active+1)}if(e.key==='ArrowUp'){e.preventDefault();select(active-1)}if(e.key==='Enter'&&current[active]) location.href=resolve(current[active][2]);});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();modal.classList.contains('open')?closeSearch():openSearch()}if(e.key==='Escape'){closeSearch();document.body.classList.remove('nav-open')}});

  // Reading memory / Continue card.
  if(page!=='home'){
    const title=document.querySelector('h1')?.textContent?.trim()||document.title;
    localStorage.setItem('crime-wiki:last',JSON.stringify({title,url:location.pathname.split('/').pop(),time:Date.now()}));
  } else {
    const holder=document.getElementById('continueCard');
    try{const last=JSON.parse(localStorage.getItem('crime-wiki:last'));if(holder&&last){holder.hidden=false;holder.querySelector('b').textContent=last.title;holder.querySelector('a').href='guides/'+last.url;}}catch(e){}
  }

  // Achievement progress, available on home and the achievements page.
  function updateAchievementProgress(){
    let done=0; for(let i=1;i<=65;i++){if(localStorage.getItem('crime-wiki:a'+String(i).padStart(2,'0'))==='1')done++;}
    document.querySelectorAll('[data-ach-progress]').forEach(el=>el.textContent=done+'/65');
    document.querySelectorAll('[data-ach-bar]').forEach(el=>el.style.width=(done/65*100)+'%');
  }
  updateAchievementProgress();

  // Mission loadout planner on the homepage.
  const target=document.getElementById('plannerTarget'), planner=document.getElementById('plannerResult');
  if(target&&planner){
    const plans={
      house:{title:'Maison / cambriolage classique',risk:'Faible → moyen',tools:['Bobby Pin','Glass Knife','Remote Hack Tool','Zip Ties'],skills:['Advanced Lockpicking','Basic Electronics','Perception'],tip:'Entre par la route la plus silencieuse, repère le lourd et rapproche-le de la sortie avant la fin.'},
      lakeside:{title:'Lakeside / VIP & cartes',risk:'Moyen',tools:['Bobby Pin','Glass Knife','Stethoscope','Scanner'],skills:['Perception III','Interrogator','Stealth II'],tip:'209 et 211 concentrent plusieurs systèmes. Fouille les coffres et garde un œil sur les objets VIP.'},
      texas:{title:'Texas Train Station',risk:'Élevé',tools:['Master Key / Master Lockpicking','Remote Hack','Thermal Goggles','Stun Gun','Zip Ties'],skills:['Master Lockpicking','Advanced Electronics','Stealth II'],tip:'Sécurité d’abord : poste de garde, codes, alarmes, tripwires, lasers et caméras. Le lourd vient après.'},
      ai:{title:'AI Research Center',risk:'Très élevé',tools:['Thermal Goggles','Stun Gun','Zip Ties','Crossbow + Sleep Darts','Scanner'],skills:['Stealth II','Perception III','Advanced Electronics'],tip:'Isole les robots. Contrôle une patrouille avant d’entrer profondément et ne compte pas sur le pistolet pour les supprimer.'},
      car:{title:'Vol de voiture',risk:'Moyen → élevé',tools:['Car Door Drill','Car Toolbox','Essence','Slots libres'],skills:['Car Theft','Agility'],tip:'Prépare réparation + carburant avant la vente. Pour Trunkload, charge 10 000 $ de loot dans un véhicule compatible.'},
      vip:{title:'Chasse aux VIP',risk:'Moyen',tools:['Scanner','Thermal Goggles','Bobby Pin','Stethoscope'],skills:['Perception III','Agility II','Stealth II'],tip:'Lakeside puis Rural Arizona donnent une bonne densité. Utilise le tracker VIP du wiki pendant ta run.'}
    };
    const draw=()=>{const p=plans[target.value];planner.innerHTML=`<div class="planner-head"><span>Plan recommandé</span><b>${p.title}</b><em>Risque : ${p.risk}</em></div><div class="planner-columns"><div><small>OUTILS</small>${p.tools.map(x=>`<span>${x}</span>`).join('')}</div><div><small>COMPÉTENCES</small>${p.skills.map(x=>`<span>${x}</span>`).join('')}</div></div><p>${p.tip}</p>`;};
    target.addEventListener('change',draw); draw();
  }

  // Tiny polish: copy direct page link from article headers.
  if(page!=='home'){
    const head=document.querySelector('.page-head');
    if(head){const actions=document.createElement('div');actions.className='page-actions';actions.innerHTML='<button type="button" class="copy-link">⛓ Copier le lien</button><span class="verified-chip">FIELD GUIDE</span>';head.appendChild(actions);actions.querySelector('button').addEventListener('click',async e=>{try{await navigator.clipboard.writeText(location.href);e.currentTarget.textContent='✓ Lien copié';setTimeout(()=>e.currentTarget.textContent='⛓ Copier le lien',1300)}catch(_){}});}
  }
});