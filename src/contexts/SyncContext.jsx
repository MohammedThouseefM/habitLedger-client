import React, { createContext, useContext, useState, useEffect } from 'react';
import syncService from '../utils/syncService';
import networkMonitor from '../utils/networkMonitor';
import syncQueue from '../utils/syncQueue';

const SyncContext = createContext();

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within SyncProvider');
    }
    return context;
};

export const SyncProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(networkMonitor.isConnected());
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(syncQueue.getPendingCount());
    const [syncError, setSyncError] = useState(null);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    useEffect(() => {
        // Subscribe to network status changes
        const unsubscribeNetwork = networkMonitor.subscribe((status) => {
            setIsOnline(status === 'online');
        });

        // Subscribe to sync events
        const unsubscribeSync = syncService.subscribe((event, data) => {
            switch (event) {
                case 'syncing':
                    setIsSyncing(true);
                    setSyncError(null);
                    break;

                case 'success':
                    setIsSyncing(false);
                    setPendingCount(0);
                    setLastSyncTime(new Date());
                    setSyncError(null);
                    break;

                case 'partial':
                    setIsSyncing(false);
                    setPendingCount(syncQueue.getPendingCount());
                    setSyncError(`${data.failed} actions failed to sync`);
                    break;

                case 'error':
                    setIsSyncing(false);
                    setPendingCount(syncQueue.getPendingCount());
                    setSyncError(data.error);
                    break;

                case 'cleared':
                    setPendingCount(0);
                    setSyncError(null);
                    break;
            }
        });

        // Update pending count periodically
        const interval = setInterval(() => {
            setPendingCount(syncQueue.getPendingCount());
        }, 5000);

        // Cleanup
        return () => {
            unsubscribeNetwork();
            unsubscribeSync();
            clearInterval(interval);
        };
    }, []);

    const manualSync = async () => {
        try {
            await syncService.manualSync();
        } catch (error) {
            console.error('Manual sync failed:', error);
        }
    };

    const clearQueue = () => {
        syncService.clearQueue();
        setPendingCount(0);
        setSyncError(null);
    };

    const value = {
        isOnline,
        isSyncing,
        pendingCount,
        syncError,
        lastSyncTime,
        manualSync,
        clearQueue
    };

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    );
};

export default SyncContext;
