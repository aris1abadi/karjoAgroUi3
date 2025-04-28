self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
  });
  
  self.addEventListener('fetch', (event) => {
    // Bisa diimprove, sekarang hanya forward request
    event.respondWith(fetch(event.request));
  });
  