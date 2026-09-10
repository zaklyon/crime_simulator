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

  const page=document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.dataset.nav===page)a.classList.add('current');
  });
});
