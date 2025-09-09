// Spiralogic Oracle Service Worker
const CACHE_NAME = 'oracle-v1';
const urlsToCache = [
  '/',
  '/holoflower',
  '/journal',
  '/analytics',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Oracle cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache if not a success
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for journal entries
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal') {
    event.waitUntil(syncJournalEntries());
  }
});

async function syncJournalEntries() {
  // Sync any offline journal entries when back online
  const cache = await caches.open('journal-sync');
  const requests = await cache.keys();
  
  return Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Send to server
      return fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(() => {
        // Remove from sync cache on success
        cache.delete(request);
      });
    })
  );
}

// Push notifications for rituals
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your sacred practice',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Oracle',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Later',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Spiralogic Oracle', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    clients.openWindow('/holoflower');
  }
});