/**
 * Calculate completion percentage
 */
export const calculateCompletionRate = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
};

/**
 * Calculate current streak
 */
export const calculateCurrentStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.log_date) - new Date(a.log_date)
    );

    let streak = 0;
    for (const log of sortedLogs) {
        if (log.completed) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

/**
 * Calculate longest streak
 */
export const calculateLongestStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // Sort logs by date ascending
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(a.log_date) - new Date(b.log_date)
    );

    let longestStreak = 0;
    let currentStreak = 0;

    for (const log of sortedLogs) {
        if (log.completed) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return longestStreak;
};

/**
 * Get habit statistics
 */
export const getHabitStats = (logs) => {
    const total = logs.length;
    const completed = logs.filter(log => log.completed).length;
    const completionRate = calculateCompletionRate(completed, total);
    const currentStreak = calculateCurrentStreak(logs);
    const longestStreak = calculateLongestStreak(logs);

    return {
        total,
        completed,
        completionRate,
        currentStreak,
        longestStreak
    };
};

/**
 * Calculate daily completion percentage
 */
export const calculateDailyCompletion = (habits, logsMap, date) => {
    if (habits.length === 0) return 0;

    let completed = 0;
    habits.forEach(habit => {
        const key = `${habit.id}_${date}`;
        if (logsMap[key] && logsMap[key].completed) {
            completed++;
        }
    });

    return calculateCompletionRate(completed, habits.length);
};
