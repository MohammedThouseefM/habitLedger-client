import React, { useState, useEffect } from 'react';
import { Loader2, Server, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api'; // Use existing api instance to ensure same base URL

const ServerWarmup = ({ children }) => {
    const [isServerReady, setIsServerReady] = useState(false);
    const [status, setStatus] = useState('checking'); // checking, waking, ready, error
    const [retryCount, setRetryCount] = useState(0);
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let intervalId;
        let timerId;

        const checkServer = async () => {
            try {
                // We use a timeout to fail fast if server is completely unresponsive (DNS/Network)
                // allowing us to retry quickly loop
                await api.get('/api/health', { timeout: 5000 });

                setStatus('ready');
                // Small delay to show the success state briefly
                setTimeout(() => {
                    setIsServerReady(true);
                }, 800);
            } catch (error) {
                console.log('Warmup check failed, retrying...', error.message);
                setStatus('waking');
                setRetryCount(prev => prev + 1);
            }
        };

        // If not ready, poll every 2 seconds
        if (!isServerReady) {
            checkServer(); // Initial check
            intervalId = setInterval(checkServer, 2000);

            // Track elapsed time for fun messages
            timerId = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (timerId) clearInterval(timerId);
        };
    }, [isServerReady, startTime]);

    // Render Children when ready
    if (isServerReady) {
        return <>{children}</>;
    }

    // Messages based on elapsed time
    const getMessage = () => {
        if (status === 'checking') return "Connecting to server...";
        if (status === 'ready') return "Connected! Launching application...";

        if (elapsedTime < 5) return "Checking server status...";
        if (elapsedTime < 15) return "Waking up the backend. This might take a moment...";
        if (elapsedTime < 30) return "Still waiting... Cold starts on free tier can take up to 60s.";
        if (elapsedTime < 60) return "Almost there! Thanks for your patience.";
        return "Taking longer than usual... Please wait.";
    };

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100] text-slate-100 p-4">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px] animate-pulse-subtle" />
                <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl items-center flex flex-col user-select-none">

                {/* Icon Animation */}
                <div className="relative mb-8">
                    {status === 'ready' ? (
                        <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center animate-bounce-subtle">
                            <CheckCircle2 className="w-10 h-10 text-teal-400" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping opacity-75" />
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center relative z-10 border border-slate-700">
                                <Server className="w-8 h-8 text-teal-400 animate-pulse" />
                            </div>
                        </>
                    )}
                </div>

                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-violet-400">
                    {status === 'ready' ? 'System Ready' : 'Server Warmup'}
                </h2>

                <p className="text-slate-400 text-center mb-6 min-h-[48px] transition-all duration-300">
                    {getMessage()}
                </p>

                {/* Progress Indicators */}
                {status !== 'ready' && (
                    <div className="w-full space-y-4">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-violet-500 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${Math.min((elapsedTime / 60) * 100, 95)}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                            <span>Attempts: {retryCount}</span>
                            <span>{elapsedTime}s</span>
                        </div>
                    </div>
                )}

                {/* Long wait helper */}
                {elapsedTime > 20 && status !== 'ready' && (
                    <div className="mt-8 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs text-yellow-200 font-medium">Why is this happening?</p>
                            <p className="text-[11px] text-yellow-500/80 leading-relaxed">
                                Our backend is hosted on a free instance that "sleeps" after inactivity. It needs a moment to wake up.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerWarmup;
