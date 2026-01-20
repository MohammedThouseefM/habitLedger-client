/**
 * Sync Service
 * Handles background synchronization with retry logic
 */

import syncQueue from './syncQueue';
import networkMonitor from './networkMonitor';
import api from './api';

class SyncService {
    constructor() {
        this.isSyncing = false;
        this.listeners = [];
        this.syncInterval = null;
        this.retryTimeout = null;

        // Start monitoring network status
        this.setupNetworkMonitoring();
    }

    /**
     * Setup network monitoring and auto-sync
     */
    setupNetworkMonitoring() {
        networkMonitor.subscribe((status) => {
            if (status === 'online') {
                console.log('Network restored, starting sync...');
                this.sync();
            }
        });

        // Periodic sync when online (every 5 minutes)
        this.syncInterval = setInterval(() => {
            if (networkMonitor.isConnected() && !syncQueue.isEmpty()) {
                this.sync();
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Sync pending actions to backend
     * @returns {Promise<Object>} - Sync results
     */
    async sync() {
        // Prevent concurrent syncs
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return { success: false, message: 'Sync in progress' };
        }

        // Check if online
        if (!networkMonitor.isConnected()) {
            console.log('Cannot sync: offline');
            return { success: false, message: 'Offline' };
        }

        // Check if queue is empty
        const pendingActions = syncQueue.getPendingActions();
        if (pendingActions.length === 0) {
            console.log('No pending actions to sync');
            return { success: true, message: 'Nothing to sync' };
        }

        this.isSyncing = true;
        this.notifyListeners('syncing', { count: pendingActions.length });

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        try {
            // Process actions in batches
            for (const action of pendingActions) {
                try {
                    await this.processAction(action);
                    syncQueue.removeAction(action.id);
                    results.success++;
                } catch (error) {
                    console.error(`Failed to sync action ${action.id}:`, error);
                    syncQueue.markActionFailed(action.id);
                    results.failed++;
                    results.errors.push({
                        actionId: action.id,
                        error: error.message
                    });
                }
            }

            // Clean up failed actions that exceeded max retries
            syncQueue.clearFailedActions();

            this.isSyncing = false;

            if (results.failed === 0) {
                this.notifyListeners('success', results);
            } else {
                this.notifyListeners('partial', results);
                // Retry failed actions with exponential backoff
                this.scheduleRetry();
            }

            return { success: true, results };
        } catch (error) {
            this.isSyncing = false;
            this.notifyListeners('error', { error: error.message });
            this.scheduleRetry();
            return { success: false, error: error.message };
        }
    }

    /**
     * Process individual action
     * @param {Object} action - Action to process
     */
    async processAction(action) {
        const { type, payload } = action;

        switch (type) {
            case 'TOGGLE_LOG':
                return await api.post('/api/logs/toggle', payload);

            case 'ADD_HABIT':
                return await api.post('/api/habits', payload);

            case 'UPDATE_HABIT':
                return await api.put(`/api/habits/${payload.id}`, payload.data);

            case 'DELETE_HABIT':
                return await api.delete(`/api/habits/${payload.id}`);

            case 'BULK_LOGS':
                return await api.post('/api/logs/bulk', payload);

            default:
                throw new Error(`Unknown action type: ${type}`);
        }
    }

    /**
     * Schedule retry with exponential backoff
     */
    scheduleRetry() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }

        // Exponential backoff: 5s, 10s, 20s, 40s...
        const pendingActions = syncQueue.getPendingActions();
        if (pendingActions.length === 0) return;

        const maxRetries = Math.max(...pendingActions.map(a => a.retries));
        const delay = Math.min(5000 * Math.pow(2, maxRetries), 60000); // Max 60s

        console.log(`Scheduling retry in ${delay}ms`);
        this.retryTimeout = setTimeout(() => {
            this.sync();
        }, delay);
    }

    /**
     * Manual sync trigger
     * @returns {Promise<Object>}
     */
    async manualSync() {
        console.log('Manual sync triggered');
        return await this.sync();
    }

    /**
     * Subscribe to sync events
     * @param {Function} callback - Callback (event, data) => void
     * @returns {Function} - Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify listeners of sync events
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in sync listener:', error);
            }
        });
    }

    /**
     * Get sync status
     * @returns {Object}
     */
    getStatus() {
        return {
            isSyncing: this.isSyncing,
            pendingCount: syncQueue.getPendingCount(),
            isOnline: networkMonitor.isConnected()
        };
    }

    /**
     * Clear sync queue
     */
    clearQueue() {
        syncQueue.clearQueue();
        this.notifyListeners('cleared', {});
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }
    }
}

// Export singleton instance
const syncService = new SyncService();
export default syncService;
