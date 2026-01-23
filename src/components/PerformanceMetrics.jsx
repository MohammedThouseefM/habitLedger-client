import React from 'react';
import { TrendingUp, Award, Target, Flame, Zap, Shield } from 'lucide-react';
import { formatDateForAPI } from '../utils/dateHelpers';

const PerformanceMetrics = ({ habits, logsMap, year, month }) => {

    // Helper to check completion
    const isCompleted = (habit, dateStr) => {
        const key = `${habit.id}_${dateStr}`;
        const log = logsMap[key];
        if (!log) return false;
        // log might be boolean (old) or object (new)
        if (typeof log === 'object') return log.completed;
        return !!log;
    };

    // Calculate streaks for a habit
    // Note: This relies on the loaded logs. For accurate lifetime stats, server-side is better.
    // Here we calculate "Visible Streak" based on loaded data.
    const calculateStats = (habit) => {
        const today = new Date();
        const formattedToday = formatDateForAPI(today);

        let currentStreak = 0;
        let bestStreak = 0;
        let totalCompleted = 0;
        let totalScheduled = 0;

        // Iterate through all days in the month (or loaded range)
        // To find CURRENT streak, we go backwards from yesterday/today

        // 1. Current Streak calculation (Backwards from today)
        let streak = 0;
        let date = new Date(today);
        // Include today if completed, otherwise start checking from yesterday
        if (isCompleted(habit, formatDateForAPI(date))) {
            streak++;
        }

        // Check backwards
        for (let i = 1; i < 365; i++) { // Check up to a year back if data exists
            date.setDate(date.getDate() - 1);
            const dateStr = formatDateForAPI(date);

            // Check if day is scheduled (if not daily)
            // If not scheduled, it doesn't break the streak, but doesn't add to it?
            // "Miss tolerance" logic: if missed but allowed, extends streak?
            // Simplification: If not scheduled, skip.
            // If scheduled and completed: streak++.
            // If scheduled and NOT completed: check tolerance? 
            // For now: break.

            // Note: We only have logsMap for the SELECTED MONTH. 
            // So this calculation is limited to the view. 
            // Ideally we need global stats.

            if (isCompleted(habit, dateStr)) {
                streak++;
            } else {
                // If we don't have data for this date (out of selected month), we stop assuming
                // unless we fetched more data. 
                // For this UI, we will just stop.
                // This is a UI limitation unless we change data fetching strategy.
                break;
            }
        }
        currentStreak = streak;

        // 2. Completion Rate in View
        const daysInView = new Date(year, month, 0).getDate();
        for (let d = 1; d <= daysInView; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (isCompleted(habit, dateStr)) {
                totalCompleted++;
            }
            // Assume daily scheduling for total count simplification or check specifics
            totalScheduled++;
        }

        const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

        return { currentStreak, completionRate };
    };

    // Aggregate stats
    const habitStats = habits.map(habit => {
        return {
            ...habit,
            ...calculateStats(habit)
        };
    });

    const overallCompletion = Math.round(habitStats.reduce((acc, curr) => acc + curr.completionRate, 0) / (habitStats.length || 1));
    const activeStreaks = habitStats.filter(h => h.currentStreak > 2).length; // Habits with streak > 2

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Overall Stats */}
            <div className="glass-panel p-3 sm:p-4 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">Performance</h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Completion Rate */}
                    <div className="bg-surface-light rounded-xl p-3 flex flex-col items-center justify-center text-center border border-border">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center mb-2 shadow-sm border border-border">
                            <Target className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xl font-bold text-text mb-0.5">{overallCompletion}%</p>
                        <p className="text-xs text-text-secondary">Completion</p>
                    </div>

                    {/* Active Streaks */}
                    <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-orange-200">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-sm">
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-xl font-bold text-text mb-0.5">{activeStreaks}</p>
                        <p className="text-xs text-text-secondary">Active Streaks</p>
                    </div>
                </div>
            </div>

            {/* Per-Habit Stats */}
            <div className="glass-panel p-3 sm:p-4 rounded-2xl">
                <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">Habit Streaks</h3>

                <div className="space-y-4">
                    {habitStats.map(habit => (
                        <div key={habit.id} className="flex items-center gap-3 group">
                            <div
                                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
                                style={{ backgroundColor: habit.color }}
                            >
                                {habit.name.substring(0, 2).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-semibold text-text truncate">{habit.name}</h4>
                                    <span className="text-xs font-medium text-text-secondary">{habit.completionRate}%</span>
                                </div>
                                <div className="w-full bg-surface-light rounded-full h-1.5 mb-2">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${habit.completionRate}%`,
                                            backgroundColor: habit.color,
                                            boxShadow: `0 0 8px ${habit.color}40`
                                        }}
                                    />
                                </div>

                                {/* Smart Streak Badges */}
                                <div className="flex gap-2">
                                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${habit.currentStreak > 0
                                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                        <Flame className="w-3 h-3" />
                                        {habit.currentStreak} day streak
                                    </span>

                                    {habit.streak_tolerance > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <Shield className="w-3 h-3" />
                                            Protection: {habit.streak_tolerance}d
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {habitStats.length === 0 && (
                        <p className="text-center text-slate-500 py-3 sm:py-4 text-xs sm:text-sm">
                            No habits to display
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceMetrics;
