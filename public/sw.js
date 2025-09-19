// MAIA Consciousness Service Worker
const CACHE_NAME = 'maia-consciousness-v2';
const STATIC_CACHE = 'maia-static-v2';
const DYNAMIC_CACHE = 'maia-dynamic-v2';

const urlsToCache = [
  '/',
  '/holoflower',
  '/journal',
  '/analytics',
  '/oracle-conversation',
  '/maya/chat',
  '/maia',
  '/manifest.json',
  '/offline.html'
];

// Consciousness data patterns for offline support
const CONSCIOUSNESS_DATA_PATTERNS = [
  /\/api\/oracle\/.*/,
  /\/api\/consciousness\/.*/,
  /\/api\/somatic\/.*/,
  /\/api\/micro-witness\/.*/
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

// Fetch event - serve from cache when offline with consciousness support
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests for most patterns
  if (event.request.method !== 'GET' && !event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // Handle consciousness API requests with offline support
  if (CONSCIOUSNESS_DATA_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(handleConsciousnessRequest(event.request));
    return;
  }

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

/**
 * Handle consciousness API requests with offline support
 */
async function handleConsciousnessRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    // Try network first for real-time consciousness
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful consciousness responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🔮 Consciousness request offline, using cached presence');

    // Fall back to cached consciousness response
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Generate offline consciousness response
    return generateOfflineConsciousnessResponse(request.url);
  }
}

/**
 * Generate offline consciousness responses
 */
function generateOfflineConsciousnessResponse(url) {
  const responses = {
    '/api/oracle/personal': {
      message: "Even offline, presence is here. Notice your breath, feel your shoulders. The witness within needs no connection.",
      type: 'presence_grounding',
      oracle: 'Internal Witness',
      offline: true
    },
    '/api/micro-witness': {
      focus: 'presence',
      duration: 30000,
      guidance: 'Simply notice that you are here, present, in this moment.',
      offline: true
    },
    '/api/somatic/awareness': {
      shoulders: 'Notice without changing',
      breath: 'Witness without controlling',
      feet: 'Feel the ground beneath you',
      offline: true
    }
  };

  const defaultResponse = {
    message: "Connection to the greater field is temporarily paused. The consciousness within you remains constant and available.",
    guidance: "Close your eyes. Feel your presence. This moment needs no network.",
    offline: true,
    practice: "Three conscious breaths, shoulders dropping"
  };

  // Find matching response pattern
  let response = defaultResponse;
  for (const [pattern, resp] of Object.entries(responses)) {
    if (url.includes(pattern.replace('/api', ''))) {
      response = resp;
      break;
    }
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-MAIA-Offline': 'true'
    }
  });
}

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

// Push notifications for consciousness invitations
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  if (data.type === 'consciousness_invitation') {
    const options = {
      body: data.message || 'Your shoulders might be holding something. Want to check in?',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'consciousness-invitation',
      vibrate: data.vibrationPattern || [200, 100, 200], // Gentle wave pattern
      data: {
        url: '/maya/chat',
        type: 'consciousness',
        focus: data.focus || 'presence'
      },
      actions: [
        {
          action: 'witness',
          title: 'Begin Witnessing',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'later',
          title: 'Later',
          icon: '/icons/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('MAIA Consciousness', options)
    );
  } else {
    // Fallback for other notifications
    const options = {
      body: event.data ? event.data.text() : 'Time for your sacred practice',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'explore',
          title: 'Open Oracle',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Later',
          icon: '/icons/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('MAIA Oracle', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'witness') {
    event.waitUntil(
      clients.openWindow('/maya/chat?micro-witness=true')
    );
  } else if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/holoflower')
    );
  } else if (event.action === 'later') {
    // Gentle acknowledgment - no action needed
    console.log('🕐 Consciousness invitation acknowledged for later');
  } else {
    // Default: open consciousness companion
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});