import { useEffect, useRef } from 'react';

const ReminderManager = ({ habits }) => {
    const checkedMinutes = useRef(new Set());

    useEffect(() => {
        // Request notification permission if not granted
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkReminders = () => {
            // Only run if we have permission
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;

            // Avoid double notifications within same minute
            const checkKey = `${now.toDateString()}-${currentTimeStr}`;
            if (checkedMinutes.current.has(checkKey)) return;

            // Find habits with reminder at this time
            habits.forEach(habit => {
                if (habit.reminder_time === currentTimeStr) {
                    // Check if habit is scheduled for today
                    // Simple check for now, can be enhanced with frequency logic
                    sendNotification(habit);
                }
            });

            checkedMinutes.current.add(checkKey);

            // Clean up old keys
            if (checkedMinutes.current.size > 60) {
                checkedMinutes.current.clear();
                checkedMinutes.current.add(checkKey);
            }
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        checkReminders(); // Check immediately

        return () => clearInterval(interval);
    }, [habits]);

    const sendNotification = (habit) => {
        try {
            const notification = new Notification(`Time for ${habit.name}!`, {
                body: `Don't forget to track your progress.`,
                icon: '/vite.svg', // or app icon
                badge: '/vite.svg',
                vibrate: [200, 100, 200]
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (e) {
            console.error('Notification error:', e);
        }
    };

    return null; // Logic only component
};

export default ReminderManager;
