import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans text-slate-100 items-center justify-center p-4">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-fade-in">

                {/* 404 Illustration */}
                <div className="relative inline-block">
                    <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-violet-600 rounded-full opacity-20 blur-xl animate-pulse-subtle"></div>
                    <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative">
                        <SearchX className="w-24 h-24 text-slate-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-violet-400 tracking-tighter">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
