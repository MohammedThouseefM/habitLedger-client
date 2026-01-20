import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, RotateCcw, X, Zap, History, Settings, Play, Pause } from 'lucide-react';
import api from '../../utils/api';
import { formatDateForAPI } from '../../utils/dateHelpers';

const CounterView = ({ habit, onClose }) => {
    const [count, setCount] = useState(habit.current_value || 0);
    const [target, setTarget] = useState(habit.target_value || 100);
    const [isAutoCounting, setIsAutoCounting] = useState(false);
    const [speed, setSpeed] = useState(1000); // ms per count
    const [timer, setTimer] = useState(0); // For time based
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Animation refs
    const countRef = useRef(count);
    const autoCountInterval = useRef(null);
    const timerInterval = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Initial load
    useEffect(() => {
        // If it's a time-based habit, initialize timer with current value
        if (habit.type === 'time') {
            setTimer(habit.current_value || 0);
        }
    }, [habit]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (autoCountInterval.current) clearInterval(autoCountInterval.current);
            if (timerInterval.current) clearInterval(timerInterval.current);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    // Haptic feedback
    const triggerHaptic = (pattern = [10]) => {
        if (navigator.vibrate) navigator.vibrate(pattern);
    };

    const saveProgress = async (newVal) => {
        // Debounce save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const dateStr = formatDateForAPI(new Date());
                await api.post('/api/logs/toggle', {
                    habitId: habit.id,
                    date: dateStr,
                    value: newVal
                });
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        }, 500);
    };

    const handleIncrement = () => {
        const newVal = count + 1;
        setCount(newVal);
        triggerHaptic();
        saveProgress(newVal);
    };

    const handleDecrement = () => {
        if (count > 0) {
            const newVal = count - 1;
            setCount(newVal);
            triggerHaptic();
            saveProgress(newVal);
        }
    };

    const toggleAutoCount = () => {
        if (isAutoCounting) {
            clearInterval(autoCountInterval.current);
            setIsAutoCounting(false);
        } else {
            setIsAutoCounting(true);
            autoCountInterval.current = setInterval(() => {
                setCount(c => {
                    const newVal = c + 1;
                    saveProgress(newVal);
                    return newVal;
                });
                triggerHaptic();
            }, speed);
        }
    };

    // Timer logic for 'time' type habits
    const toggleTimer = () => {
        if (isTimerRunning) {
            clearInterval(timerInterval.current);
            setIsTimerRunning(false);
        } else {
            setIsTimerRunning(true);
            timerInterval.current = setInterval(() => {
                setTimer(t => {
                    const newVal = t + 1;
                    saveProgress(newVal);
                    return newVal;
                });
            }, 1000);
        }
    };

    // Format time helper
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate progress for circle
    const percentage = habit.type === 'time'
        ? Math.min((timer / target) * 100, 100)
        : Math.min((count / target) * 100, 100);

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center justify-center p-4 h-full w-full bg-slate-900/40 backdrop-blur-sm animate-fade-in">

            {/* Main White Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-scale-in border border-white/50">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white"
                            style={{ backgroundColor: habit.color }}
                        />
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg leading-tight">{habit.name}</h2>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                {habit.type === 'time' ? 'Timer Session' : 'Counter Session'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center justify-center gap-8 relative bg-white">

                    {/* Interactive Progress Circle */}
                    <div className="relative group cursor-pointer" onClick={habit.type === 'time' ? toggleTimer : handleIncrement}>
                        {/* SVG Ring */}
                        <svg className="transform -rotate-90 w-72 h-72 drop-shadow-xl">
                            {/* Track */}
                            <circle
                                cx="144"
                                cy="144"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="16"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            {/* Progress */}
                            <circle
                                cx="144"
                                cy="144"
                                r={radius}
                                stroke="currentColor" // Uses current color from class
                                strokeWidth="16"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="text-primary-500 transition-all duration-500 ease-out"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                            <span className="text-6xl font-bold text-gray-800 tabular-nums tracking-tight transition-transform duration-100 active:scale-95">
                                {habit.type === 'time' ? formatTime(timer) : count}
                            </span>
                            <span className="text-sm text-gray-400 font-semibold mt-2 uppercase tracking-wide">
                                / {habit.type === 'time' ? formatTime(target) : target} Goal
                            </span>

                            {/* Hover Hint */}
                            <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${habit.type === 'time' && isTimerRunning
                                    ? 'bg-amber-100 text-amber-600 opacity-100'
                                    : 'bg-primary-50 text-primary-600 opacity-0 group-hover:opacity-100'
                                }`}>
                                {habit.type === 'time' ? (isTimerRunning ? 'Pause' : 'Start') : 'Tap'}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 w-full justify-center">
                        {habit.type === 'count' && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
                                    className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-all active:scale-95"
                                >
                                    <ChevronDown size={28} />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleAutoCount(); }}
                                    className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95 ${isAutoCounting
                                            ? 'bg-amber-500 text-white shadow-amber-200 ring-4 ring-amber-100'
                                            : 'bg-white border-2 border-primary-100 text-primary-500 hover:border-primary-400'
                                        }`}
                                >
                                    {isAutoCounting ? (
                                        <Pause size={32} fill="currentColor" strokeWidth={0} />
                                    ) : (
                                        <Zap size={32} strokeWidth={2} />
                                    )}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                                    className="w-14 h-14 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-200 hover:bg-primary-600 flex items-center justify-center transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95"
                                >
                                    <ChevronUp size={28} />
                                </button>
                            </>
                        )}

                        {habit.type === 'time' && (
                            <button
                                onClick={toggleTimer}
                                className={`h-16 px-10 rounded-2xl flex items-center gap-3 font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${isTimerRunning
                                        ? 'bg-amber-500 text-white shadow-amber-200 ring-4 ring-amber-100'
                                        : 'bg-primary-500 text-white shadow-primary-200 hover:bg-primary-600'
                                    }`}
                            >
                                {isTimerRunning ? (
                                    <>
                                        <Pause size={24} fill="currentColor" strokeWidth={0} />
                                        <span>Pause Session</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={24} fill="currentColor" strokeWidth={0} />
                                        <span>Start Timer</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="bg-gray-50 border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-200">
                    <div className="p-4 text-center group cursor-default">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Current Streak</span>
                        <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg group-hover:scale-110 transition-transform">
                            <span>{habit.streak || 0}</span>
                            <span className="text-sm">🔥</span>
                        </div>
                    </div>

                    <div className="p-4 text-center group cursor-default">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Goal Progress</span>
                        <div className="text-primary-600 font-bold text-lg group-hover:scale-110 transition-transform">
                            {Math.round(percentage)}%
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (habit.type === 'time') setTimer(0);
                            else setCount(0);
                            saveProgress(0);
                        }}
                        className="p-4 text-center hover:bg-red-50 transition-colors group"
                    >
                        <span className="block text-[10px] text-gray-400 group-hover:text-red-400 uppercase font-bold tracking-wider mb-1 transition-colors">Reset</span>
                        <div className="flex items-center justify-center text-gray-500 group-hover:text-red-500 transition-colors">
                            <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CounterView;
