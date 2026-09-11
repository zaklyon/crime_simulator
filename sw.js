const CACHE='the-hideout-v1';
const CORE=['./','./index.html','./crew.html','./assets/style.css','./assets/v4.css','./assets/hideout.css','./assets/app.js','./assets/v4.js','./assets/crew.js','./assets/icon.svg','./guides/progression.html','./guides/xp-fast.html','./guides/skills.html','./guides/golden-cards.html','./guides/tools.html','./guides/furniture.html','./guides/maps.html','./guides/heists.html','./guides/vehicles.html','./guides/chemistry.html','./guides/achievements.html','./guides/secrets.html','./guides/fast-techs.html','./guides/vouchers.html','./guides/vip-items.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
});