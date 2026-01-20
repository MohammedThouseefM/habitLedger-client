import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventCountdown from '../components/EventCountdown';

const Events = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-slate-400 hover:text-white transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Dashboard
                        </button>
                        <h1 className="text-2xl font-bold text-white">Events</h1>
                        <p className="text-slate-400 text-sm">Track upcoming deadlines and milestones</p>
                    </div>
                </div>

                {/* Content */}
                <div className="glass-panel p-6 rounded-2xl">
                    <EventCountdown />
                </div>
            </div>
        </div>
    );
};

export default Events;
