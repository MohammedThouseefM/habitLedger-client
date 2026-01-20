import axios from 'axios';
import syncQueue from './syncQueue';
import networkMonitor from './networkMonitor';

const API_URL = import.meta.env.VITE_API_URL || 'https://habitledger-server.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Check if offline and queue the request
        if (!networkMonitor.isConnected()) {
            // Only queue mutation requests (POST, PUT, DELETE)
            if (['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
                return Promise.reject({
                    isOffline: true,
                    config,
                    message: 'Offline - request queued'
                });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle offline errors
        if (error.isOffline) {
            // Request was queued, return optimistic response
            return Promise.resolve({
                data: { queued: true },
                config: error.config
            });
        }

        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Network error - might be offline
        if (!error.response && error.message === 'Network Error') {
            console.warn('Network error detected');
        }

        return Promise.reject(error);
    }
);

/**
 * Wrapper for API calls with offline support
 */
const apiWithOffline = {
    ...api,

    /**
     * POST with offline queue support
     */
    async post(url, data, config) {
        try {
            return await api.post(url, data, config);
        } catch (error) {
            if (error.isOffline) {
                // Queue the action
                const actionType = this.getActionType(url, 'POST');
                if (actionType) {
                    syncQueue.addAction({
                        type: actionType,
                        payload: data,
                        url,
                        method: 'POST'
                    });
                }
                // Return optimistic response
                return { data: { ...data, queued: true } };
            }
            throw error;
        }
    },

    /**
     * PUT with offline queue support
     */
    async put(url, data, config) {
        try {
            return await api.put(url, data, config);
        } catch (error) {
            if (error.isOffline) {
                const actionType = this.getActionType(url, 'PUT');
                if (actionType) {
                    syncQueue.addAction({
                        type: actionType,
                        payload: { id: this.extractId(url), data },
                        url,
                        method: 'PUT'
                    });
                }
                return { data: { ...data, queued: true } };
            }
            throw error;
        }
    },

    /**
     * DELETE with offline queue support
     */
    async delete(url, config) {
        try {
            return await api.delete(url, config);
        } catch (error) {
            if (error.isOffline) {
                const actionType = this.getActionType(url, 'DELETE');
                if (actionType) {
                    syncQueue.addAction({
                        type: actionType,
                        payload: { id: this.extractId(url) },
                        url,
                        method: 'DELETE'
                    });
                }
                return { data: { queued: true } };
            }
            throw error;
        }
    },

    /**
     * GET (no offline support - just use regular axios)
     */
    get: api.get.bind(api),

    /**
     * Determine action type from URL and method
     */
    getActionType(url, method) {
        if (url.includes('/api/logs/toggle')) return 'TOGGLE_LOG';
        if (url.includes('/api/logs/bulk')) return 'BULK_LOGS';
        if (url.includes('/api/habits') && method === 'POST') return 'ADD_HABIT';
        if (url.includes('/api/habits') && method === 'PUT') return 'UPDATE_HABIT';
        if (url.includes('/api/habits') && method === 'DELETE') return 'DELETE_HABIT';
        return null;
    },

    /**
     * Extract ID from URL
     */
    extractId(url) {
        const match = url.match(/\/(\d+)$/);
        return match ? match[1] : null;
    }
};

export default apiWithOffline;

