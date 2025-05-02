self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
});

self.addEventListener('fetch', (event) => {
  // Esto permite interceptar peticiones y ayuda a cumplir con los requisitos mínimos de una PWA
  event.respondWith(fetch(event.request));
});