/**
 * IndexedDB Hook for Offline Evolution History
 * Enables offline-first experience with background sync
 */

import { useEffect, useState, useCallback, useRef } from 'react';

const DB_NAME = 'ARIA_Maya_Offline';
const DB_VERSION = 1;

interface OfflineData {
  presence: PresenceUpdate[];
  milestones: Milestone[];
  archetypes: Archetype[];
  interactions: Interaction[];
}

interface PresenceUpdate {
  timestamp: number;
  value: number;
  factors: Record<string, number>;
  sessionId: string;
}

interface Milestone {
  id: string;
  session: number;
  type: string;
  title: string;
  achieved: boolean;
  timestamp: number;
}

interface Archetype {
  id: string;
  name: string;
  discoveredAt: number;
  characteristics: string[];
}

interface Interaction {
  id: string;
  type: string;
  timestamp: number;
  data: any;
}

export const useOfflineSync = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncQueue = useRef<any[]>([]);

  // Initialize IndexedDB
  useEffect(() => {
    if (typeof window === 'undefined' || !window.indexedDB) return;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
    };

    request.onsuccess = () => {
      const database = request.result;
      setDb(database);
      console.log('IndexedDB initialized');

      // Start background sync
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('maya-sync');
        });
      }
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('presence')) {
        const presenceStore = database.createObjectStore('presence', {
          keyPath: 'timestamp'
        });
        presenceStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      if (!database.objectStoreNames.contains('milestones')) {
        const milestoneStore = database.createObjectStore('milestones', {
          keyPath: 'id'
        });
        milestoneStore.createIndex('session', 'session', { unique: false });
      }

      if (!database.objectStoreNames.contains('archetypes')) {
        const archetypeStore = database.createObjectStore('archetypes', {
          keyPath: 'id'
        });
        archetypeStore.createIndex('discoveredAt', 'discoveredAt', { unique: false });
      }

      if (!database.objectStoreNames.contains('interactions')) {
        const interactionStore = database.createObjectStore('interactions', {
          keyPath: 'id',
          autoIncrement: true
        });
        interactionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!database.objectStoreNames.contains('syncQueue')) {
        database.createObjectStore('syncQueue', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    };

    return () => {
      db?.close();
    };
  }, []);

  // Save presence update to IndexedDB
  const savePresenceUpdate = useCallback(async (update: PresenceUpdate) => {
    if (!db) return;

    const transaction = db.transaction(['presence'], 'readwrite');
    const store = transaction.objectStore('presence');

    try {
      await promisifyRequest(store.add({
        ...update,
        timestamp: Date.now(),
        synced: false
      }));

      // Prune old data (keep last 100 entries)
      const allData = await getAllFromStore(store);
      if (allData.length > 100) {
        const toDelete = allData
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(100);

        for (const item of toDelete) {
          await promisifyRequest(store.delete(item.timestamp));
        }
      }
    } catch (error) {
      console.error('Error saving presence:', error);
    }
  }, [db]);

  // Save milestone to IndexedDB
  const saveMilestone = useCallback(async (milestone: Milestone) => {
    if (!db) return;

    const transaction = db.transaction(['milestones'], 'readwrite');
    const store = transaction.objectStore('milestones');

    try {
      await promisifyRequest(store.put(milestone));
    } catch (error) {
      console.error('Error saving milestone:', error);
    }
  }, [db]);

  // Save novel archetype discovery
  const saveArchetype = useCallback(async (archetype: Archetype) => {
    if (!db) return;

    const transaction = db.transaction(['archetypes'], 'readwrite');
    const store = transaction.objectStore('archetypes');

    try {
      await promisifyRequest(store.put(archetype));
      // Queue for sync when online
      await queueForSync('archetype_discovery', archetype);
    } catch (error) {
      console.error('Error saving archetype:', error);
    }
  }, [db]);

  // Track interaction for A/B testing
  const trackInteraction = useCallback(async (type: string, data: any) => {
    if (!db) return;

    const transaction = db.transaction(['interactions'], 'readwrite');
    const store = transaction.objectStore('interactions');

    try {
      await promisifyRequest(store.add({
        type,
        timestamp: Date.now(),
        data,
        synced: false
      }));
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [db]);

  // Get offline data
  const getOfflineData = useCallback(async (): Promise<OfflineData | null> => {
    if (!db) return null;

    try {
      const transaction = db.transaction(
        ['presence', 'milestones', 'archetypes', 'interactions'],
        'readonly'
      );

      const [presence, milestones, archetypes, interactions] = await Promise.all([
        getAllFromStore(transaction.objectStore('presence')),
        getAllFromStore(transaction.objectStore('milestones')),
        getAllFromStore(transaction.objectStore('archetypes')),
        getAllFromStore(transaction.objectStore('interactions'))
      ]);

      return { presence, milestones, archetypes, interactions };
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }, [db]);

  // Queue data for background sync
  const queueForSync = useCallback(async (type: string, data: any) => {
    if (!db) return;

    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    try {
      await promisifyRequest(store.add({
        type,
        data,
        timestamp: Date.now(),
        attempts: 0
      }));

      // Request sync if online
      if (navigator.onLine && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('maya-sync');
      }
    } catch (error) {
      console.error('Error queuing for sync:', error);
    }
  }, [db]);

  // Sync with server when online
  const syncWithServer = useCallback(async () => {
    if (!db || !navigator.onLine || isSyncing) return;

    setIsSyncing(true);

    try {
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const queue = await getAllFromStore(store);

      for (const item of queue) {
        try {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });

          if (response.ok) {
            // Remove from queue
            await promisifyRequest(store.delete(item.id));
          } else if (item.attempts < 3) {
            // Increment attempts
            item.attempts++;
            await promisifyRequest(store.put(item));
          } else {
            // Too many attempts, remove from queue
            console.error('Sync failed after 3 attempts:', item);
            await promisifyRequest(store.delete(item.id));
          }
        } catch (error) {
          console.error('Sync error:', error);
        }
      }

      setLastSync(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [db, isSyncing]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online, syncing...');
      syncWithServer();
    };

    const handleOffline = () => {
      console.log('Offline mode activated');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic sync every 5 minutes when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncWithServer();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncWithServer]);

  return {
    savePresenceUpdate,
    saveMilestone,
    saveArchetype,
    trackInteraction,
    getOfflineData,
    syncWithServer,
    isSyncing,
    lastSync,
    isOffline: !navigator.onLine,
    syncData: {
      savePresenceUpdate,
      saveMilestone,
      saveArchetype,
    }
  };
};

// Helper functions
function promisifyRequest(request: IDBRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(store: IDBObjectStore): Promise<any[]> {
  const request = store.getAll();
  return promisifyRequest(request);
}