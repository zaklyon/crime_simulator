document.addEventListener('DOMContentLoaded',()=>{
  const KEY='hideout:tasks:v1';
  const OBJ='hideout:objective';
  const NOTE='hideout:note';
  const CREW='hideout:crew';

  const presets={
    xp:{label:'XP GRIND',tasks:[
      ['Prendre 2–3 jobs sur la même zone','tonight','XP'],
      ['Faire une mission téléphone si elle tombe sur la route','tonight','XP'],
      ['Vérifier les Item Requests avant de vendre','tonight','REQUEST'],
      ['Dépasser le quota seulement une fois la run sécurisée','later','XP'],
      ['Acheter Bookstand / Reader dès que possible','later','UPGRADE']
    ]},
    vip:{label:'VIP HUNT',tasks:[
      ['Passer par 209 Electronics Store','tonight','VIP'],
      ['Passer par 211 Henderson’s','tonight','VIP'],
      ['Prendre Scanner / Thermal si dispo','tonight','LOADOUT'],
      ['Atteindre 5 VIP pour Requests Beacon','later','UNLOCK'],
      ['Atteindre 10 VIP pour Trash Bin','later','UNLOCK']
    ]},
    furniture:{label:'UNLOCK RUN',tasks:[
      ['Atteindre 10 jobs pour Powerlifting Bench','tonight','UNLOCK'],
      ['Finir 3 Item Requests pour Hackerman Table','tonight','UNLOCK'],
      ['Finir 5 Challenges pour Refund Chest','later','UNLOCK'],
      ['Gagner une boucle pour Voucher Machine / Military Receiver','later','UNLOCK'],
      ['Économiser 15 000 C pour Hideout Expansion','later','PLANQUE']
    ]},
    texas:{label:'TEXAS PREP',tasks:[
      ['Vérifier que le plan Texas est bien dans le camion','tonight','HEIST'],
      ['Prendre solution Master Lockpicking / Master Key','tonight','LOADOUT'],
      ['Prendre Remote Hack + contrôle non létal','tonight','LOADOUT'],
      ['Traiter poste de garde, alarmes, tripwires et lasers avant le loot','tonight','HEIST'],
      ['Regrouper le lourd près d’une sortie avant extraction','later','HEIST']
    ]},
    achievements:{label:'ACHIEVEMENTS',tasks:[
      ['Choisir 3 succès faisables dans la même run','tonight','100%'],
      ['Vérifier les contraintes police avant de lancer la run','tonight','100%'],
      ['Préparer voiture + 10 000 $ coffre si Trunkload visé','later','100%'],
      ['Garder une recette 100 % pour Breaking Bad','later','100%']
    ]}
  };

  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
  const save=t=>localStorage.setItem(KEY,JSON.stringify(t));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const add=(text,status='tonight',tag='CREW')=>{const t=load();t.push({id:uid(),text,status,tag,created:Date.now()});save(t);refresh();};
  const mutate=(id,fn)=>{const t=load();const i=t.findIndex(x=>x.id===id);if(i<0)return;fn(t[i],t,i);save(t);refresh();};
  const remove=id=>{save(load().filter(x=>x.id!==id));refresh();};
  const stats=()=>{const t=load(),done=t.filter(x=>x.status==='done').length;return{all:t.length,done,pct:t.length?Math.round(done/t.length*100):0,tonight:t.filter(x=>x.status==='tonight').length,later:t.filter(x=>x.status==='later').length}};

  function refresh(){renderBoard();renderHome();}

  function renderHome(){
    const wrap=document.querySelector('[data-home-crew]');if(!wrap)return;
    const s=stats();const obj=localStorage.getItem(OBJ)||'Aucun objectif défini';
    wrap.querySelector('[data-home-objective]').textContent=obj;
    wrap.querySelector('[data-home-progress-label]').textContent=s.all?`${s.done}/${s.all} tâches terminées`:'Aucune tâche préparée';
    wrap.querySelector('[data-home-progress]').style.width=s.pct+'%';
    wrap.querySelector('[data-home-tonight]').textContent=s.tonight;
  }

  function renderBoard(){
    const board=document.querySelector('[data-task-board]');if(!board)return;
    const tasks=load();
    const s=stats();
    const all=document.querySelector('[data-stat-all]');if(all)all.textContent=s.all;
    const tonight=document.querySelector('[data-stat-tonight]');if(tonight)tonight.textContent=s.tonight;
    const done=document.querySelector('[data-stat-done]');if(done)done.textContent=s.done;
    const pct=document.querySelector('[data-crew-progress]');if(pct)pct.style.width=s.pct+'%';
    const pctText=document.querySelector('[data-crew-progress-text]');if(pctText)pctText.textContent=s.pct+'% terminé';

    ['tonight','later','done'].forEach(status=>{
      const list=board.querySelector(`[data-list="${status}"]`);if(!list)return;
      const rows=tasks.filter(x=>x.status===status);
      const count=board.querySelector(`[data-count="${status}"]`);if(count)count.textContent=rows.length;
      list.innerHTML=rows.length?rows.map(x=>`<div class="task-item ${status==='done'?'done':''}" data-id="${x.id}"><div class="task-line"><input type="checkbox" ${status==='done'?'checked':''} aria-label="Terminer"><div class="task-text">${esc(x.text)}</div></div><span class="task-tag">${esc(x.tag||'CREW')}</span><div class="task-actions">${status!=='tonight'?'<button data-move="tonight">ce soir</button>':''}${status!=='later'?'<button data-move="later">plus tard</button>':''}${status!=='done'?'<button data-move="done">terminé</button>':''}<button data-delete>suppr.</button></div></div>`).join(''):'<div class="task-empty">Rien ici pour l’instant.</div>';
    });

    board.querySelectorAll('.task-item').forEach(el=>{
      const id=el.dataset.id;
      el.querySelector('input')?.addEventListener('change',e=>mutate(id,x=>x.status=e.target.checked?'done':'tonight'));
      el.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>mutate(id,x=>x.status=b.dataset.move)));
      el.querySelector('[data-delete]')?.addEventListener('click',()=>remove(id));
    });
  }

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const objective=document.querySelector('[data-objective-input]');
  if(objective){objective.value=localStorage.getItem(OBJ)||'';objective.addEventListener('input',()=>{localStorage.setItem(OBJ,objective.value.trim());renderHome();});}
  const note=document.querySelector('[data-session-note]');
  if(note){note.value=localStorage.getItem(NOTE)||'';note.addEventListener('input',()=>localStorage.setItem(NOTE,note.value));}
  const crew=document.querySelector('[data-crew-input]');
  if(crew){crew.value=localStorage.getItem(CREW)||'';crew.addEventListener('input',()=>localStorage.setItem(CREW,crew.value));}

  document.querySelector('[data-add-task]')?.addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');const text=input.value.trim();if(!text)return;add(text,'tonight','CUSTOM');input.value='';input.focus();});

  document.querySelectorAll('[data-preset]').forEach(btn=>btn.addEventListener('click',()=>{
    const p=presets[btn.dataset.preset];if(!p)return;
    const existing=load();
    p.tasks.forEach(([text,status,tag])=>{if(!existing.some(x=>x.text===text))existing.push({id:uid(),text,status,tag,created:Date.now()});});
    save(existing);if(!localStorage.getItem(OBJ))localStorage.setItem(OBJ,p.label);refresh();
  }));

  document.querySelector('[data-clear-done]')?.addEventListener('click',()=>{save(load().filter(x=>x.status!=='done'));refresh();});
  document.querySelector('[data-reset-board]')?.addEventListener('click',()=>{if(confirm('Vider complètement le plan de crew ?')){save([]);refresh();}});
  document.querySelector('[data-copy-plan]')?.addEventListener('click',async e=>{
    const t=load(),obj=localStorage.getItem(OBJ)||'Opération Crime Simulator',crewNames=localStorage.getItem(CREW)||'';
    const lines=[`THE HIDEOUT — ${obj}`,crewNames?`Crew : ${crewNames}`:'', '', 'CE SOIR',...t.filter(x=>x.status==='tonight').map(x=>'☐ '+x.text),'','PLUS TARD',...t.filter(x=>x.status==='later').map(x=>'• '+x.text),'','TERMINÉ',...t.filter(x=>x.status==='done').map(x=>'✓ '+x.text)].filter((x,i,a)=>x!==''||a[i-1]!=='' );
    try{await navigator.clipboard.writeText(lines.join('\n'));const old=e.currentTarget.textContent;e.currentTarget.textContent='✓ Plan copié';setTimeout(()=>e.currentTarget.textContent=old,1400);}catch(err){}
  });

  refresh();
});
