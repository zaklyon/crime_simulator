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

  // Furniture was split into its own catalogue after the multi-page redesign.
  // Inject the link into older page sidebars so every guide gets the new section
  // without duplicating navigation maintenance in each static HTML file.
  const toolsLink=document.querySelector('[data-nav="tools"]');
  if(toolsLink && !document.querySelector('[data-nav="furniture"]')){
    const furniture=document.createElement('a');
    furniture.dataset.nav='furniture';
    furniture.textContent='Meubles';
    furniture.href=location.pathname.includes('/guides/') ? 'furniture.html' : 'guides/furniture.html';
    toolsLink.insertAdjacentElement('afterend',furniture);
  }

  const page=document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.dataset.nav===page)a.classList.add('current');
  });
});
