import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 text-slate-100 p-4">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[100px] animate-pulse-subtle" />
                <div className="absolute bottom-[30%] right-[30%] w-[40%] h-[40%] bg-violet-600/5 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Visual Loader */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-violet-200">
                        Habits Ledger
                    </h3>
                    <p className="text-slate-500 text-sm font-medium animate-pulse">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
