import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';

/**
 * Get all days in a month
 */
export const getDaysInMonth = (year, month) => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return eachDayOfInterval({ start, end });
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date) => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * Get week number for a date within a month
 */
export const getWeekOfMonth = (date) => {
    const firstDay = startOfMonth(date);
    const firstDayOfWeek = getDay(firstDay);
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

/**
 * Group days by week
 */
export const groupDaysByWeek = (days) => {
    const weeks = {};
    days.forEach(day => {
        const week = getWeekOfMonth(day);
        if (!weeks[week]) {
            weeks[week] = [];
        }
        weeks[week].push(day);
    });
    return weeks;
};

/**
 * Navigate to next month
 */
export const getNextMonth = (year, month) => {
    const date = addMonths(new Date(year, month - 1), 1);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1
    };
};

/**
 * Navigate to previous month
 */
export const getPreviousMonth = (year, month) => {
    const date = subMonths(new Date(year, month - 1), 1);
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1
    };
};

/**
 * Get month name
 */
export const getMonthName = (month) => {
    const date = new Date(2024, month - 1);
    return format(date, 'MMMM');
};

/**
 * Get day name (short)
 */
export const getDayName = (date) => {
    return format(date, 'EEE');
};

/**
 * Get day number
 */
export const getDayNumber = (date) => {
    return format(date, 'd');
};
