// Offline storage using IndexedDB for local persistence
// Sync queue for pending changes when offline

interface OfflineChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface CanvasState {
  nodes: any[];
  edges: any[];
  viewport: { x: number; y: number; zoom: number };
}

class OfflineStorage {
  private dbName = 'ai-canvas-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('changes')) {
          const changesStore = db.createObjectStore('changes', { keyPath: 'id' });
          changesStore.createIndex('timestamp', 'timestamp');
          changesStore.createIndex('synced', 'synced');
        }

        if (!db.objectStoreNames.contains('canvas')) {
          db.createObjectStore('canvas', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('nodes')) {
          db.createObjectStore('nodes', { keyPath: 'id' });
        }
      };
    });
  }

  // Store canvas state locally
  async saveCanvasState(canvasId: string, state: CanvasState): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['canvas'], 'readwrite');
      const store = transaction.objectStore('canvas');
      
      const request = store.put({
        id: canvasId,
        state,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get canvas state from local storage
  async getCanvasState(canvasId: string): Promise<CanvasState | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['canvas'], 'readonly');
      const store = transaction.objectStore('canvas');
      const request = store.get(canvasId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.state : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Queue change for sync when online
  async queueChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init();

    const offlineChange: OfflineChange = {
      ...change,
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['changes'], 'readwrite');
      const store = transaction.objectStore('changes');
      
      const request = store.add(offlineChange);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending changes
  async getPendingChanges(): Promise<OfflineChange[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['changes'], 'readonly');
      const store = transaction.objectStore('changes');
      const index = store.index('synced');
      const request = index.getAll(false as any); // Get unsynced changes

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark change as synced
  async markChangeSynced(changeId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['changes'], 'readwrite');
      const store = transaction.objectStore('changes');
      const request = store.get(changeId);

      request.onsuccess = () => {
        const change = request.result;
        if (change) {
          change.synced = true;
          const updateRequest = store.put(change);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear synced changes
  async clearSyncedChanges(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['changes'], 'readwrite');
      const store = transaction.objectStore('changes');
      const index = store.index('synced');
      const request = index.getAll(true as any); // Get synced changes

      request.onsuccess = () => {
        const syncedChanges = request.result;
        const deletePromises = syncedChanges.map(change => {
          return new Promise<void>((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(change.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Check if online
  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  // Listen for online/offline events
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}; // No-op for SSR
    }

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Sync manager for handling online/offline sync
export class SyncManager {
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for online/offline events
      offlineStorage.onOnlineStatusChange((online) => {
        this.isOnline = online;
        if (online && !this.syncInProgress) {
          this.syncPendingChanges();
        }
      });
    }
  }

  // Sync pending changes when coming online
  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const pendingChanges = await offlineStorage.getPendingChanges();
      
      for (const change of pendingChanges) {
        try {
          // Apply change to server
          await this.applyChangeToServer(change);
          
          // Mark as synced
          await offlineStorage.markChangeSynced(change.id);
        } catch (error) {
          console.error('Failed to sync change:', change.id, error);
          // Keep change in queue for retry
        }
      }

      // Clean up synced changes
      await offlineStorage.clearSyncedChanges();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Apply change to server (implement based on your API)
  private async applyChangeToServer(change: OfflineChange): Promise<void> {
    // This would call your Convex mutations
    // For now, just log the change
    console.log('Applying change to server:', change);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Queue a change for offline sync
  async queueChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    await offlineStorage.queueChange(change);
    
    // If online, try to sync immediately
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingChanges();
    }
  }
}

// Export singleton sync manager
export const syncManager = new SyncManager();
