(()=>{
const init=()=>{
  const xp=document.querySelector('[data-xp-planner]');
  if(xp){
    const select=xp.querySelector('[data-xp-profile]'), out=xp.querySelector('[data-xp-output]');
    const plans={
      early:{title:'Début — rendement sans outils chers',desc:'Rural + téléphones dès le niveau 2. Le but est de superposer les objectifs, pas de vider toutes les maisons.',cols:[['AVANT LA NUIT','Prendre 2–3 jobs sur la même zone','Lire les Item Requests','Vérifier les challenges faciles'],['SUR PLACE','Timed Job si proche','Petits loots + objets à chaîne','Surplus quota si la nuit est safe'],['PRIORITÉS','Reader dès qu’il apparaît','Bookstand dès déblocage','Slots avant gadgets']]},
      mid:{title:'Midgame — Lakeside en boucle',desc:'Quand 209/211 ne te font plus peur, leur densité d’objectifs donne un très bon XP/temps.',cols:[['LOADOUT','Glass Knife + Bobby Pin','Stethoscope / Scanner','Stun ou Zip Ties'],['OBJECTIFS','Job + VIP + Request ensemble','Téléphone seulement si proche','Coffres et électronique'],['UPGRADES','Bookstand actif','Powerlifting Bench','Hackerman Table']]},
      late:{title:'Endgame — progression ciblée',desc:'Les heists ne sont bons en XP/heure que si tu connais déjà la route. Sinon, une Lakeside propre reste souvent meilleure.',cols:[['CHOIX','Heist si route maîtrisée','Sinon zone dense connue','Challenges/vouchers en parallèle'],['VALEUR','Requests rares','VIP + collections','Surplus quota sécurisé'],['PASSIFS','Reader','Bookstand','King-size Bed']]},
      coop:{title:'Coop — paralléliser les sources XP',desc:'À 2–4, répartissez les rôles : un joueur prépare/contrôle, les autres extraient et remplissent plusieurs objectifs en même temps.',cols:[['RÔLES','Scout / Perception','Breaker / lock-hack','Mule / extraction'],['ROUTE','2 joueurs dans la cible','1 joueur camion/drop-off','Téléphones intégrés au trajet'],['BONUS','Reader partage les leaflets','Bookstand équipe','Golden Cards équipe']]}
    };
    const draw=()=>{const p=plans[select.value];out.innerHTML=`<h3>${p.title}</h3><p>${p.desc}</p><div class="xp-plan-grid">${p.cols.map(c=>`<div><small>${c[0]}</small>${c.slice(1).map(x=>`<span>${x}</span>`).join('')}</div>`).join('')}</div>`};
    select.addEventListener('change',draw);draw();
  }

  const dash=document.querySelector('[data-unlock-dashboard]');
  if(dash){
    const inputs=[...dash.querySelectorAll('[data-stat]')];
    let filter='all';
    const rows=[...document.querySelectorAll('#furnitureTable tbody tr[data-req]')];
    const buttons=[...document.querySelectorAll('[data-furniture-filter]')];
    const parse=s=>s.split(';').filter(Boolean).map(x=>{const [k,n]=x.split(':');return [k,Number(n||1)]});
    const labels={jobs:'jobs',requests:'requests',vip:'VIP volés',wins:'boucles gagnées',credits:'crédits gagnés dans la boucle',items:'objets volés',challenges:'challenges',furniture:'meubles placés',expansion:'extension',dlc:'DLC Ashen Creek'};
    const val=k=>{const i=inputs.find(x=>x.dataset.stat===k);return !i?0:(i.type==='checkbox'?(i.checked?1:0):(parseInt(i.value||'0',10)||0));};
    const applyFilter=()=>rows.forEach(r=>{const match=filter==='all'||r.dataset.state===filter||(filter==='top'&&Number(r.dataset.rank||99)<=2);r.classList.toggle('hidden',!match)});
    const recalc=()=>{
      let unlocked=0;const roadmap=[];
      rows.forEach(r=>{const req=parse(r.dataset.req);const missing=req.filter(([k,n])=>val(k)<n);const chip=r.querySelector('[data-lock-status]');const isOpen=!missing.length;r.dataset.state=isOpen?'open':'locked';if(isOpen)unlocked++;
        if(chip){chip.className='status-chip '+(isOpen?'open':'locked');chip.textContent=isOpen?'DISPONIBLE':'LOCK';}
        if(!isOpen){const gaps=missing.map(([k,n])=>{const cur=val(k);if(k==='expansion'||k==='dlc')return labels[k];return `${Math.max(0,n-cur)} ${labels[k]}`});roadmap.push({name:r.querySelector('strong')?.textContent||'Meuble',gap:gaps.join(' · '),rank:Number(r.dataset.rank||99)});}
      });
      roadmap.sort((a,b)=>a.rank-b.rank);
      dash.querySelector('[data-unlocked-count]').textContent=unlocked+' / '+rows.length;
      dash.querySelector('[data-locked-count]').textContent=(rows.length-unlocked)+' restant(s)';
      const list=dash.querySelector('[data-unlock-roadmap]');list.innerHTML=roadmap.slice(0,8).map((x,i)=>`<div class="unlock-roadmap-item"><b>${x.name}</b><span>${x.gap}</span><em>#${String(i+1).padStart(2,'0')} à viser</em></div>`).join('')||'<div class="note">Tout ce qui est suivi ici est débloqué avec tes valeurs actuelles.</div>';
      applyFilter();
    };
    inputs.forEach(i=>{const k='crime-wiki:unlock:'+i.dataset.stat;const saved=localStorage.getItem(k);if(saved!==null){if(i.type==='checkbox')i.checked=saved==='1';else i.value=saved;}const save=()=>{localStorage.setItem(k,i.type==='checkbox'?(i.checked?'1':'0'):i.value);recalc();};i.addEventListener('input',save);i.addEventListener('change',save);});
    buttons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.furnitureFilter;buttons.forEach(x=>x.classList.toggle('active',x===b));applyFilter();}));
    recalc();
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
