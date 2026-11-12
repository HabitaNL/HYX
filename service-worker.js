// HYX v1.3 - HTML network-first to prevent stale installed PWA; offline fallback.
const CACHE='hyx-v1.3';
const CORE=['./','./index.html','./manifest.webmanifest','./version.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hyx-v')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 // The version check must always reach the network when connected.
 if(url.pathname.endsWith('/version.json')){
  event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match('./version.json')));return;
 }
 if(req.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname==='/'||url.pathname.endsWith('/')){
  event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)))}
   return response;
  }).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
