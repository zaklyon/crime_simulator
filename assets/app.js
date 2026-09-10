document.addEventListener('DOMContentLoaded',()=>{
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
    box.addEventListener('change',()=>localStorage.setItem(key,box.checked?'1':'0'));
  });

  const inGuides=location.pathname.includes('/guides/');

  // Extra sections added after the first multi-page redesign are injected here
  // so the static sidebars stay consistent across every guide page.
  const toolsLink=document.querySelector('[data-nav="tools"]');
  if(toolsLink && !document.querySelector('[data-nav="furniture"]')){
    const furniture=document.createElement('a');
    furniture.dataset.nav='furniture';
    furniture.textContent='Meubles';
    furniture.href=inGuides ? 'furniture.html' : 'guides/furniture.html';
    toolsLink.insertAdjacentElement('afterend',furniture);
  }

  const mapsLink=document.querySelector('[data-nav="maps"]');
  if(mapsLink && !document.querySelector('[data-nav="heists"]')){
    const heists=document.createElement('a');
    heists.dataset.nav='heists';
    heists.textContent='Braquages';
    heists.href=inGuides ? 'heists.html' : 'guides/heists.html';
    mapsLink.insertAdjacentElement('afterend',heists);
  }

  const page=document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.dataset.nav===page)a.classList.add('current');
  });
});
