import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileHeader = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border sticky top-0 z-40 safe-area-top">
            <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-xl object-contain" />
                <span className="font-bold text-lg text-primary tracking-tight">Habits</span>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;
