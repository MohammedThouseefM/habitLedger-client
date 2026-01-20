import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Clock, FileText, Settings, LogOut, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Clock, label: 'Time Tracking', path: '/time-tracking' },
        { icon: Calendar, label: 'Events', path: '/events' },
        { icon: FileText, label: 'Notes', path: '/notes' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 fixed left-0 top-0 z-50">
            {/* Logo Area */}
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-center">
                <img src="/logo.png" alt="Habits Ledger" className="h-16 w-auto object-contain rounded-2xl" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">
                    Menu
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary-500/10 text-primary-400 font-medium shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                : 'hover:bg-slate-800/50 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-slate-800">
                {user && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-600" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">Pro Account</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
