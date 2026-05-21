self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar requests del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback si no hay red
        return new Response('Sin conexión', { status: 503 });
      })
  );
});