/**
 * Sync Queue Manager
 * Manages offline actions queue in localStorage
 */

const QUEUE_KEY = 'habit_sync_queue';
const MAX_RETRIES = 3;

class SyncQueue {
    constructor() {
        this.queue = this.loadQueue();
    }

    /**
     * Load queue from localStorage
     */
    loadQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading sync queue:', error);
            return [];
        }
    }

    /**
     * Save queue to localStorage
     */
    saveQueue() {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('Error saving sync queue:', error);
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, clearing old entries');
                this.clearOldEntries();
            }
        }
    }

    /**
     * Add action to queue
     * @param {Object} action - Action to queue
     * @returns {string} - Action ID
     */
    addAction(action) {
        const queuedAction = {
            id: this.generateId(),
            timestamp: Date.now(),
            retries: 0,
            ...action
        };

        this.queue.push(queuedAction);
        this.saveQueue();

        return queuedAction.id;
    }

    /**
     * Get all pending actions
     * @returns {Array} - Pending actions
     */
    getPendingActions() {
        return this.queue.filter(action => action.retries < MAX_RETRIES);
    }

    /**
     * Get pending actions count
     * @returns {number}
     */
    getPendingCount() {
        return this.getPendingActions().length;
    }

    /**
     * Remove action from queue
     * @param {string} actionId - Action ID to remove
     */
    removeAction(actionId) {
        this.queue = this.queue.filter(action => action.id !== actionId);
        this.saveQueue();
    }

    /**
     * Mark action as failed (increment retry count)
     * @param {string} actionId - Action ID
     */
    markActionFailed(actionId) {
        const action = this.queue.find(a => a.id === actionId);
        if (action) {
            action.retries += 1;
            action.lastError = Date.now();
            this.saveQueue();
        }
    }

    /**
     * Clear all actions from queue
     */
    clearQueue() {
        this.queue = [];
        this.saveQueue();
    }

    /**
     * Clear failed actions (exceeded max retries)
     */
    clearFailedActions() {
        this.queue = this.queue.filter(action => action.retries < MAX_RETRIES);
        this.saveQueue();
    }

    /**
     * Clear old entries (older than 7 days)
     */
    clearOldEntries() {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.queue = this.queue.filter(action => action.timestamp > sevenDaysAgo);
        this.saveQueue();
    }

    /**
     * Generate unique ID for action
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get queue size
     * @returns {number}
     */
    size() {
        return this.queue.length;
    }

    /**
     * Check if queue is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.queue.length === 0;
    }
}

// Export singleton instance
const syncQueue = new SyncQueue();
export default syncQueue;
