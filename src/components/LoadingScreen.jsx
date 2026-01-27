import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center z-50 text-text p-4">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse-subtle" />
                <div className="absolute bottom-[30%] right-[30%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Visual Loader */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 glass-panel rounded-2xl border border-white/50 flex items-center justify-center shadow-2xl ring-1 ring-white/20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                        Habits Ledger
                    </h3>
                    <p className="text-text-secondary text-sm font-medium animate-pulse">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
