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
        <div className="glass-panel rounded-2xl overflow-hidden border border-border shadow-xl bg-surface/50 flex-1 flex flex-col min-h-0">
            <div className="flex flex-1 min-h-0">
                {/* Fixed Left Column - Habit Names */}
                <div className="flex-shrink-0 border-r border-border bg-surface/90 backdrop-blur-xl z-20 w-[140px] md:w-[200px] lg:w-[240px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
                    {/* Header */}
                    <div className="font-bold text-text-secondary uppercase tracking-wider px-3 md:px-4 text-[10px] md:text-xs h-[64px] flex items-center border-b border-border">
                        Habit
                    </div>

                    {/* Habit Names */}
                    <div className="py-2 space-y-1">
                        {habits.map((habit) => (
                            <div
                                key={habit.id}
                                className="group flex items-center justify-between px-4 h-[44px] hover:bg-surface-light transition-colors relative cursor-pointer"
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
                                        <span className="text-sm font-medium text-text-secondary truncate group-hover:text-primary transition-colors" title={habit.name}>
                                            {habit.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit/Delete Actions (Visible on Hover) */}
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-surface pl-2 rounded-l-lg shadow-md z-20 border border-border">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
                                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-surface-light rounded-md transition-colors"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete "${habit.name}"?`)) onDelete(habit.id);
                                        }}
                                        className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {habits.length === 0 && (
                        <div className="px-4 py-8 text-text-secondary text-sm italic">
                            No habits yet. Click "New Habit" to start!
                        </div>
                    )}
                </div>

                {/* Scrollable Right Section - Dates and Checkboxes */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-surface/20" ref={scrollContainerRef}>
                    <div className="min-w-max">
                        {/* Header Row - Days */}
                        <div className="flex gap-1 md:gap-2 border-b border-border h-[64px] items-center px-2 md:px-4 sticky top-0 bg-surface/90 backdrop-blur-xl z-10">
                            {days.map((day) => {
                                const dateStr = formatDateForAPI(day);
                                const isToday = dateStr === currentDate;

                                return (
                                    <div
                                        key={day.toString()}
                                        ref={isToday ? todayRef : null}
                                        className={`flex flex-col items-center justify-center rounded-xl transition-all ${isToday
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                            : 'hover:bg-surface-light text-text-secondary'
                                            }`}
                                        style={{ width: '40px', height: '48px' }}
                                    >
                                        <div className={`text-[9px] uppercase font-bold tracking-tight ${isToday ? 'text-white/80' : ''}`}>
                                            {getDayName(day)}
                                        </div>
                                        <div className={`text-sm font-bold leading-none mt-0.5 ${isToday ? 'text-white' : ''}`}>
                                            {getDayNumber(day)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Checkboxes Grid */}
                        <div className="py-2 space-y-1 px-2 md:px-4">
                            {habits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className="flex gap-1 md:gap-2 h-[44px] items-center hover:bg-surface-light/50 transition-colors rounded-lg"
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
