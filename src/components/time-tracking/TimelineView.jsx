import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SCALING_FACTOR = 60; // 1 hour = 60px height

const TimelineView = ({ activities, onEdit, onAdd, selectedDate }) => {
    const containerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to 8 AM or current time on mount
    useEffect(() => {
        if (containerRef.current) {
            const hour = new Date().getHours();
            const scrollHour = hour > 8 ? hour - 1 : 8; // Default to 8 AM or 1 hour before current
            containerRef.current.scrollTop = scrollHour * SCALING_FACTOR;
        }
    }, []);

    // Helper to calculate position
    const getPosition = (dateStr) => {
        const date = new Date(dateStr);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return (hours * 60 + minutes) * (SCALING_FACTOR / 60);
    };

    const getDurationHeight = (startStr, endStr) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const durationMinutes = (end - start) / (1000 * 60);
        return Math.max(durationMinutes * (SCALING_FACTOR / 60), 20); // Min height 20px
    };

    const isToday = new Date().toISOString().split('T')[0] === selectedDate;

    return (
        <div className="bg-transparent flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
                <h3 className="font-semibold text-slate-300">Timeline</h3>
                <div className="text-xs text-slate-500">
                    1h = {SCALING_FACTOR}px
                </div>
            </div>

            {/* Scrollable Area */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth"
            >
                {/* Time Grid */}
                <div className="relative min-h-[1440px]"> {/* 24 * 60px */}
                    {HOURS.map(hour => (
                        <div
                            key={hour}
                            className="absolute w-full border-t border-dashed border-slate-800 flex items-start group"
                            style={{ top: hour * SCALING_FACTOR, height: SCALING_FACTOR }}
                        >
                            <span className="text-xs text-slate-600 w-12 text-right pr-3 -mt-2 bg-slate-900/80 group-hover:text-primary-400 transition-colors">
                                {hour.toString().padStart(2, '0')}:00
                            </span>

                            {/* Hour interactions */}
                            <div className="flex-1 h-full relative group/slot">
                                <button
                                    onClick={() => onAdd({ hour })}
                                    className="absolute inset-0 w-full h-full opacity-0 group-hover/slot:opacity-100 bg-primary-500/10 flex items-center justify-center transition-all duration-200"
                                >
                                    <Plus className="w-5 h-5 text-primary-400" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Current Time Indicator */}
                    {isToday && (
                        <div
                            className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none flex items-center"
                            style={{ top: (currentTime.getHours() * 60 + currentTime.getMinutes()) * (SCALING_FACTOR / 60) }}
                        >
                            <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            <span className="bg-red-500 text-white text-[10px] px-1 rounded ml-1 font-bold shadow-sm">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}

                    {/* Activity Blocks */}
                    {activities.map(activity => {
                        const top = getPosition(activity.start_time);
                        const height = getDurationHeight(activity.start_time, activity.end_time);

                        return (
                            <div
                                key={activity.id}
                                onClick={() => !activity.isReminder && onEdit(activity)}
                                className={`absolute left-14 right-2 sm:right-4 rounded-lg px-3 py-2 border-l-4 shadow-sm transition-all duration-200 group overflow-hidden z-10 ${activity.isReminder ? 'cursor-default opacity-80' : 'cursor-pointer hover:shadow-md hover:brightness-110'
                                    }`}
                                style={{
                                    top,
                                    height,
                                    backgroundColor: `${activity.color || '#6366f1'}20`, // Light opacity
                                    borderLeftColor: activity.color || '#6366f1',
                                    zIndex: 10,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-200 text-xs sm:text-sm truncate drop-shadow-md">
                                            {activity.name}
                                        </div>
                                        {height > 40 && (
                                            <div className="text-[10px] sm:text-xs text-slate-300/80 truncate font-medium">
                                                {new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(activity.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        {height > 60 && activity.description && (
                                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
