import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, ChevronRight, X } from 'lucide-react';
import { formatDateForAPI } from '../utils/dateHelpers';

const NotificationCenter = ({ habits, logsMap }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const today = new Date();
    const currentDateStr = formatDateForAPI(today);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter habits scheduled for today
    const todaysHabits = habits.filter(habit => {
        // Daily
        if (habit.frequency_type === 'daily') return true;

        // Specific Dates
        if (habit.frequency_type === 'dates') {
            let scheduledDays = habit.frequency_days;
            if (typeof scheduledDays === 'string') {
                try { scheduledDays = JSON.parse(scheduledDays); } catch (e) { return false; }
            }
            return Array.isArray(scheduledDays) && scheduledDays.includes(currentDateStr);
        }

        // Specific Weekdays
        if (!habit.frequency_days) return true; // Default to every day if null?

        const dayIndex = today.getDay();
        let scheduledDays = habit.frequency_days;
        if (typeof scheduledDays === 'string') {
            try { scheduledDays = JSON.parse(scheduledDays); } catch (e) { return true; }
        }

        return Array.isArray(scheduledDays) && scheduledDays.includes(dayIndex);
    });

    // Determine Status
    const pendingHabits = [];
    const completedHabits = [];

    todaysHabits.forEach(habit => {
        const key = `${habit.id}_${currentDateStr}`;
        const logEntry = logsMap[key];

        // Check if completed based on habit type
        let isCompleted = false;

        if (logEntry) {
            if (typeof logEntry === 'object') {
                isCompleted = logEntry.completed;
            } else {
                isCompleted = !!logEntry;
            }
        }

        if (isCompleted) {
            completedHabits.push(habit);
        } else {
            pendingHabits.push(habit);
        }
    });

    const pendingCount = pendingHabits.length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-surface-light transition-colors border border-transparent hover:border-border outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Notifications"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'text-teal-400' : ''}`} />

                {/* Badge */}
                {pendingCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl z-50 transform origin-top-right transition-all animate-fade-in divide-y divide-border overflow-hidden">

                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between bg-surface/80">
                        <div>
                            <h3 className="font-semibold text-text">Notifications</h3>
                            <p className="text-xs text-text-secondary mt-0.5">
                                {pendingCount > 0
                                    ? `You have ${pendingCount} pending tasks today`
                                    : "You're all caught up for today!"}
                            </p>
                        </div>
                        {pendingCount === 0 && (
                            <div className="p-1.5 rounded-full bg-teal-500/10 text-teal-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    {/* Content List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {pendingCount > 0 ? (
                            <div className="py-2">
                                <h4 className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Pending Tasks
                                </h4>
                                {pendingHabits.map(habit => (
                                    <div key={habit.id} className="px-5 py-3 hover:bg-surface-light transition-colors flex items-start gap-3 group cursor-default">
                                        <div
                                            className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: habit.color, boxShadow: `0 0 8px ${habit.color}60` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                                                {habit.name}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                <span>Due today</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-5 py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-text-secondary" />
                                </div>
                                <h4 className="text-text font-medium mb-1">No pending tasks</h4>
                                <p className="text-sm text-text-secondary max-w-[200px] mx-auto">
                                    Great job! You've completed all your habits for today.
                                </p>
                            </div>
                        )}

                        {/* Completed Section (Collapsed/Optional) */}
                        {completedHabits.length > 0 && pendingCount > 0 && (
                            <div className="py-2 opacity-50 hover:opacity-100 transition-opacity bg-slate-900/30">
                                <h4 className="px-5 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                    <span>Completed ({completedHabits.length})</span>
                                </h4>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
