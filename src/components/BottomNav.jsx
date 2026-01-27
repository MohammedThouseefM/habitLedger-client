import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, Calendar, FileText, CheckSquare } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
        { id: 'time', icon: Clock, label: 'Time', path: '/time-tracking' },
        { id: 'todo', icon: CheckSquare, label: 'To-Do', path: '/todo' },
        { id: 'events', icon: Calendar, label: 'Events', path: '/events' },
        { id: 'notes', icon: FileText, label: 'Notes', path: '/notes' },
    ];

    const handleNavigation = (item) => {
        if (item.isAction) {
            // For actions, we want to stay on dashboard or go there if not already
            if (location.pathname !== '/dashboard') {
                navigate(`/dashboard${item.action}`);
            } else {
                // If already on dashboard, just append/replace query param
                navigate(item.action);
            }
        } else {
            navigate(item.path);
        }
    };

    const isActive = (item) => {
        if (item.isAction) {
            return location.search.includes(item.action);
        }
        return location.pathname === item.path;
    };

    // Don't show on login page
    if (location.pathname === '/login' || location.pathname === '/auth/callback') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border px-4 py-2 lg:hidden z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${isActive(item)
                            ? 'text-primary'
                            : 'text-text-secondary hover:text-text'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium mt-1">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
