// Service worker: funciona sin conexión y dispara avisos en segundo plano.
const CACHE = 'miespacio-v1';
const REM_CACHE = 'miespacio-reminders';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'config.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];
const CDN = 'https://cdn.jsdelivr.net/';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== REM_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Librerías del CDN: versión fija, así que primero caché.
  if (req.url.startsWith(CDN)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  // Archivos de la app: primero red (para recibir cambios), si no hay conexión, caché.
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
  }
});

// Revisión periódica (Chrome en Android con la app instalada).
async function checkReminders() {
  const c = await caches.open(REM_CACHE);
  const remRes = await c.match('reminders');
  if (!remRes) return;
  const reminders = await remRes.json();
  const firedRes = await c.match('fired');
  const fired = firedRes ? await firedRes.json() : [];
  const now = Date.now();
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  let changed = false;
  for (const r of reminders) {
    if (fired.includes(r.key) || now < r.at || !sameDay(r.at, now)) continue;
    await self.registration.showNotification(r.title, { body: r.body, tag: r.key, icon: 'icon-192.png', badge: 'icon-192.png' });
    fired.push(r.key);
    changed = true;
  }
  if (changed) await c.put('fired', new Response(JSON.stringify(fired.slice(-300))));
}

self.addEventListener('periodicsync', e => {
  if (e.tag === 'miespacio-reminders') e.waitUntil(checkReminders());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(w => w.url.startsWith(self.registration.scope));
    return open ? open.focus() : self.clients.openWindow(self.registration.scope);
  }));
});
