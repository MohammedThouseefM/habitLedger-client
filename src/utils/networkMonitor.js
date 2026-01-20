/**
 * Network Monitor
 * Monitors network connectivity status and emits events
 */

class NetworkMonitor {
    constructor() {
        this.listeners = [];
        this.isOnline = navigator.onLine;
        this.setupListeners();
    }

    /**
     * Setup event listeners for online/offline events
     */
    setupListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyListeners('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners('offline');
        });

        // Additional check using fetch to verify actual connectivity
        // (navigator.onLine can be unreliable)
        this.startPeriodicCheck();
    }

    /**
     * Periodic connectivity check (every 30 seconds when offline)
     */
    startPeriodicCheck() {
        setInterval(() => {
            if (!this.isOnline) {
                this.checkConnectivity();
            }
        }, 30000);
    }

    /**
     * Check actual connectivity by making a lightweight request
     */
    async checkConnectivity() {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            if (response.ok && !this.isOnline) {
                this.isOnline = true;
                this.notifyListeners('online');
            }
        } catch (error) {
            if (this.isOnline) {
                this.isOnline = false;
                this.notifyListeners('offline');
            }
        }
    }

    /**
     * Subscribe to network status changes
     * @param {Function} callback - Callback function (status) => void
     * @returns {Function} - Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of status change
     * @param {string} status - 'online' or 'offline'
     */
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in network status listener:', error);
            }
        });
    }

    /**
     * Get current online status
     * @returns {boolean}
     */
    getStatus() {
        return this.isOnline;
    }

    /**
     * Check if currently online
     * @returns {boolean}
     */
    isConnected() {
        return this.isOnline;
    }

    /**
     * Check if currently offline
     * @returns {boolean}
     */
    isDisconnected() {
        return !this.isOnline;
    }
}

// Export singleton instance
const networkMonitor = new NetworkMonitor();
export default networkMonitor;
