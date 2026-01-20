import React, { useEffect, useRef } from 'react';
import HabitInteraction from './HabitInteraction';
import { getDaysInMonth, getDayNumber, getDayName, formatDateForAPI } from '../utils/dateHelpers';
import { Settings, Trash2 } from 'lucide-react';

const HabitGrid = ({ year, month, habits, logsMap, onToggle, onHabitClick, onEdit, onDelete }) => {
    const days = getDaysInMonth(year, month);
    const today = new Date();
    const currentDate = formatDateForAPI(today);

    // Scroll handling
    const scrollContainerRef = useRef(null);
    const todayRef = useRef(null);

    useEffect(() => {
        // Scroll to today's date on mount or when days change
        if (todayRef.current) {
            todayRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [days]);

    const isDayScheduled = (habit, date) => {
        if (habit.frequency_type === 'daily') return true;

        const dateStr = formatDateForAPI(date);

        if (habit.frequency_type === 'dates') {
            // For 'dates', frequency_days contains the specific date string(s)
            let scheduledDays = habit.frequency_days;
            if (typeof scheduledDays === 'string') {
                try { scheduledDays = JSON.parse(scheduledDays); } catch (e) { return false; }
            }
            if (Array.isArray(scheduledDays)) {
                return scheduledDays.includes(dateStr);
            }
            return false;
        }

        if (!habit.frequency_days) return true;

        const dayIndex = date.getDay();
        let scheduledDays = habit.frequency_days;
        if (typeof scheduledDays === 'string') {
            try { scheduledDays = JSON.parse(scheduledDays); } catch (e) { return true; }
        }

        return Array.isArray(scheduledDays) && scheduledDays.includes(dayIndex);
    };

    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900/50 flex-1 flex flex-col min-h-0">
            <div className="flex flex-1 min-h-0">
                {/* Fixed Left Column - Habit Names */}
                <div className="flex-shrink-0 border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-md z-10 w-[200px] lg:w-[240px]">
                    {/* Header */}
                    <div className="font-bold text-slate-500 uppercase tracking-wider px-4 text-xs h-[72px] flex items-end pb-3 border-b border-slate-700/50 bg-slate-900">
                        Habit
                    </div>

                    {/* Habit Names */}
                    <div className="py-2 space-y-1">
                        {habits.map((habit) => (
                            <div
                                key={habit.id}
                                className="group flex items-center justify-between px-4 h-[44px] hover:bg-slate-800/50 transition-colors relative cursor-pointer"
                                onClick={() => onHabitClick(habit)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px] transition-all"
                                        style={{
                                            backgroundColor: habit.color,
                                            boxShadow: `0 0 8px ${habit.color}40`
                                        }}
                                    />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors" title={habit.name}>
                                            {habit.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit/Delete Actions (Visible on Hover) */}
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-slate-800 pl-2 rounded-l-lg shadow-md z-20">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
                                        className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete "${habit.name}"?`)) onDelete(habit.id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {habits.length === 0 && (
                        <div className="px-4 py-8 text-slate-500 text-sm italic">
                            No habits yet. Click "New Habit" to start!
                        </div>
                    )}
                </div>

                {/* Scrollable Right Section - Dates and Checkboxes */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-slate-900/20" ref={scrollContainerRef}>
                    <div className="min-w-max">
                        {/* Header Row - Days */}
                        <div className="flex gap-2 border-b border-slate-700/50 pb-3 h-[72px] items-end px-4 sticky top-0 bg-slate-900/95 z-10 backdrop-blur-sm">
                            {days.map((day) => {
                                const dateStr = formatDateForAPI(day);
                                const isToday = dateStr === currentDate;

                                return (
                                    <div
                                        key={day.toString()}
                                        ref={isToday ? todayRef : null}
                                        className={`text-center flex-shrink-0 rounded-xl transition-all ${isToday ? 'bg-primary-600/20 shadow-[0_0_15px_rgba(20,184,166,0.2)] border border-primary-500/30' : 'hover:bg-slate-800/30'
                                            }`}
                                        style={{ width: '40px', padding: '6px 0' }}
                                    >
                                        <div className={`text-[10px] font-bold uppercase mb-0.5 ${isToday ? 'text-primary-400' : 'text-slate-500'
                                            }`}>
                                            {getDayName(day)}
                                        </div>
                                        <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-400'
                                            }`}>
                                            {getDayNumber(day)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Checkboxes Grid */}
                        <div className="py-2 space-y-1 px-4">
                            {habits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className="flex gap-2 h-[44px] items-center hover:bg-slate-800/20 transition-colors rounded-lg"
                                >
                                    {days.map((day) => {
                                        const dateStr = formatDateForAPI(day);
                                        const isScheduled = isDayScheduled(habit, day);
                                        const key = `${habit.id}_${dateStr}`;
                                        const logEntry = logsMap[key];
                                        const log = typeof logEntry === 'object' ? logEntry : { completed: !!logEntry, current_value: logEntry ? 1 : 0 };

                                        if (!isScheduled) {
                                            return (
                                                <div
                                                    key={dateStr}
                                                    className="flex justify-center items-center flex-shrink-0 opacity-20 hover:opacity-100 transition-opacity"
                                                    style={{ width: '40px', height: '44px' }}
                                                >
                                                    <HabitInteraction
                                                        habit={habit}
                                                        log={log}
                                                        dateStr={dateStr}
                                                        onUpdate={onToggle}
                                                        onClick={() => onHabitClick(habit)}
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={dateStr}
                                                className="flex justify-center items-center flex-shrink-0"
                                                style={{ width: '40px', height: '44px' }}
                                            >
                                                <HabitInteraction
                                                    habit={habit}
                                                    log={log}
                                                    dateStr={dateStr}
                                                    onUpdate={onToggle}
                                                    onClick={() => onHabitClick(habit)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitGrid;
