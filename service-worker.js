const CACHE_NAME = "booking-calendar-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./admin.html",
  "./css/style.css",
  "./css/admin.css",
  "./js/app.js",
  "./js/booking.js",
  "./js/calendar.js",
  "./js/admin.js",
  "./manifest.json",
  "./images/calender.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});