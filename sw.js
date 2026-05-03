const CACHE_NAME = "cozy-hub-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/meds.html",
  "/journal.html",
  "/period-tracker.html",
  "/css/dashboard.css",
  "/css/meds.css",
  "/css/periods.css",
  "/js/dashboard.js",
  "/js/meds.js",
  "/js/periods.js",
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
];

// 1. Install Service Worker and Cache Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// 2. Activate and Clean Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

// 3. Fetch Logic (Network First, then Cache)
// This ensures she gets the latest data from Supabase if online,
// but the app still opens if she's offline.
self.addEventListener("fetch", (event) => {
  // Skip caching for Supabase API calls (we want real-time data)
  if (event.request.url.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network works, update the cache with the new version
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)), // If offline, use cache
  );
});

// 4. Handle Background Notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Open the app when the notification is clicked
  event.waitUntil(clients.openWindow("/"));
});
