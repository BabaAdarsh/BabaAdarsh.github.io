/* Offline-first static shell only. NO private user data is put into Cache Storage. */
const VERSION='adarsh-hq-pwa-v14-backend-status-20261114';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('adarsh-hq-pwa-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const target=new URL(event.request.url);
 // Cache only the public app shell. Never cache private requests or API responses.
 const publicPaths=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).pathname));
 if(!publicPaths.has(target.pathname))return;
 event.respondWith(fetch(event.request).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(cache=>cache.put(event.request,c));}return r;}).catch(()=>caches.match(event.request).then(c=>c||caches.match('./index.html'))));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>clients.length?clients[0].focus():self.clients.openWindow('./')))});