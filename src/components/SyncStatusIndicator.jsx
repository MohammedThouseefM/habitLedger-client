import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useSync } from '../contexts/SyncContext';

const SyncStatusIndicator = () => {
    const { isOnline, isSyncing, pendingCount, syncError, manualSync } = useSync();

    const getStatusInfo = () => {
        if (!isOnline) {
            return {
                icon: WifiOff,
                text: 'Offline',
                color: 'text-gray-500',
                bgColor: 'bg-gray-100',
                showPending: true
            };
        }

        if (isSyncing) {
            return {
                icon: RefreshCw,
                text: 'Syncing...',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                animate: true,
                showPending: false
            };
        }

        if (syncError) {
            return {
                icon: AlertCircle,
                text: 'Sync Error',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                showPending: true,
                showRetry: true
            };
        }

        if (pendingCount > 0) {
            return {
                icon: Cloud,
                text: 'Pending',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                showPending: true
            };
        }

        return {
            icon: CheckCircle,
            text: 'Online',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            showPending: false
        };
    };

    const status = getStatusInfo();
    const Icon = status.icon;

    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} transition-all`}>
                <Icon
                    className={`w-4 h-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`}
                />
                <span className={`text-xs font-medium ${status.color}`}>
                    {status.text}
                </span>
                {status.showPending && pendingCount > 0 && (
                    <span className={`text-xs font-bold ${status.color} ml-1`}>
                        ({pendingCount})
                    </span>
                )}
            </div>

            {status.showRetry && (
                <button
                    onClick={manualSync}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title="Retry sync"
                >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
            )}
        </div>
    );
};

export default SyncStatusIndicator;
