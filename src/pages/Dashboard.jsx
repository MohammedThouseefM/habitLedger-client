import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSync } from '../contexts/SyncContext';
import { LogOut, User, Clock, RotateCcw, FileText, Plus } from 'lucide-react';
import api from '../utils/api';
import { getNextMonth, getPreviousMonth, formatDateForAPI } from '../utils/dateHelpers';
import MonthSelector from '../components/MonthSelector';
import HabitGrid from '../components/HabitGrid';
import MonthlyChart from '../components/MonthlyChart';
import PerformanceMetrics from '../components/PerformanceMetrics';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import CounterView from '../components/counter/CounterView';
import ReminderManager from '../components/ReminderManager';
import NotificationCenter from '../components/NotificationCenter';
import LoadingScreen from '../components/LoadingScreen';
import HabitModal from '../components/HabitModal'; // New Modal

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, logout, isAuthenticated } = useAuth();

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [habits, setHabits] = useState([]);
    const [logsMap, setLogsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedHabit, setSelectedHabit] = useState(null);

    // Modal State
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [habitModalMode, setHabitModalMode] = useState('create'); // 'create' or 'edit'
    const [editingHabit, setEditingHabit] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [year, month, isAuthenticated]);

    // Check URL for add action
    useEffect(() => {
        if (searchParams.get('action') === 'add-habit') {
            openCreateModal();
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch habits
            const habitsResponse = await api.get('/api/habits');
            setHabits(habitsResponse.data);

            // Fetch logs for the month
            const logsResponse = await api.get(`/api/logs/month/${year}/${month}`);
            setLogsMap(logsResponse.data.logs || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        const prev = getPreviousMonth(year, month);
        setYear(prev.year);
        setMonth(prev.month);
    };

    const handleNextMonth = () => {
        const next = getNextMonth(year, month);
        setYear(next.year);
        setMonth(next.month);
    };

    // Modal Handlers
    const openCreateModal = () => {
        setEditingHabit(null);
        setHabitModalMode('create');
        setIsHabitModalOpen(true);
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setHabitModalMode('edit');
        setIsHabitModalOpen(true);
    };

    const handleSaveHabit = async (habitData) => {
        if (habitModalMode === 'create') {
            await handleAddHabit(habitData);
        } else {
            await handleUpdateHabit(editingHabit.id, habitData);
        }
    };

    const handleAddHabit = async (habitData) => {
        try {
            const response = await api.post('/api/habits', habitData);
            setHabits([...habits, response.data]);
        } catch (error) {
            console.error('Error adding habit:', error);
            alert('Failed to add habit');
        }
    };

    const handleUpdateHabit = async (id, habitData) => {
        try {
            const response = await api.put(`/api/habits/${id}`, habitData);
            setHabits(habits.map(h => h.id === id ? response.data : h));
        } catch (error) {
            console.error('Error updating habit:', error);
            alert('Failed to update habit');
        }
    };

    const handleDeleteHabit = async (id) => {
        try {
            await api.delete(`/api/habits/${id}`);
            setHabits(habits.filter(h => h.id !== id));

            // Remove logs for this habit from the map
            const newLogsMap = { ...logsMap };
            Object.keys(newLogsMap).forEach(key => {
                if (key.startsWith(`${id}_`)) {
                    delete newLogsMap[key];
                }
            });
            setLogsMap(newLogsMap);
        } catch (error) {
            console.error('Error deleting habit:', error);
            alert('Failed to delete habit');
        }
    };


    const handleHabitClick = (habit) => {
        if (habit.type === 'count' || habit.type === 'time') {
            setSelectedHabit(habit);
        }
    };

    const handleToggleLog = async ({ habitId, date, value }) => {
        const key = `${habitId}_${date}`;
        const currentLog = logsMap[key];

        const habit = habits.find(h => h.id === habitId);
        let optimisticCompleted = false;

        if (habit) {
            if (habit.type === 'boolean') {
                optimisticCompleted = value === 1;
            } else {
                optimisticCompleted = value >= (habit.target_value || 1);
            }
        }

        const optimisticLog = {
            completed: optimisticCompleted,
            current_value: value,
            id: currentLog?.id || 'temp' // optional
        };

        setLogsMap({
            ...logsMap,
            [key]: { ...currentLog, ...optimisticLog }
        });

        try {
            const response = await api.post('/api/logs/toggle', { habitId, date, value });

            if (response.data.queued) {
                // Offline handling
                return;
            }

            // Update with real server response
            setLogsMap(prev => ({
                ...prev,
                [key]: {
                    completed: response.data.completed,
                    current_value: response.data.current_value,
                    id: currentLog?.id // keep id if existed
                }
            }));
        } catch (error) {
            console.error('Error toggling log:', error);

            // Revert
            setLogsMap(prev => ({
                ...prev,
                [key]: currentLog
            }));

            alert('Failed to update habit log.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <LoadingScreen message="Loading your habits..." />;
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight leading-tight">
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <br className="hidden md:block" />
                            <span className="text-primary">{user?.name?.split(' ')[0] || 'User'}</span>
                        </h1>
                        <p className="text-text-secondary mt-1 text-sm md:text-base">Ready to crush your goals today?</p>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {/* Sync Indicator - Desktop */}
                        <div className="hidden sm:block">
                            <SyncStatusIndicator />
                        </div>

                        <div className="glass-panel p-1 rounded-xl flex items-center shadow-sm">
                            <MonthSelector
                                year={year}
                                month={month}
                                onPrevious={handlePreviousMonth}
                                onNext={handleNextMonth}
                                compact={false}
                            />
                        </div>

                        <NotificationCenter habits={habits} logsMap={logsMap} />

                        <button
                            onClick={openCreateModal}
                            className="btn btn-primary whitespace-nowrap shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">New Habit</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sync Indicator (visible only on small screens) */}
            <div className="sm:hidden">
                <SyncStatusIndicator />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 flex-1 min-h-0">
                {/* Main Content - Grid (Takes 3 columns on large screens) */}
                <div className="xl:col-span-3 flex flex-col gap-6 min-h-0">
                    <ReminderManager habits={habits} />

                    <div className="flex-1 min-h-[400px]">
                        <HabitGrid
                            year={year}
                            month={month}
                            habits={habits}
                            logsMap={logsMap}
                            onToggle={handleToggleLog}
                            onHabitClick={handleHabitClick}
                            onEdit={openEditModal}
                            onDelete={handleDeleteHabit}
                        />
                    </div>

                    <MonthlyChart
                        year={year}
                        month={month}
                        habits={habits}
                        logsMap={logsMap}
                    />
                </div>

                {/* Right Sidebar - Metrics (Takes 1 column) */}
                <div className="xl:col-span-1 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
                    <PerformanceMetrics
                        habits={habits}
                        logsMap={logsMap}
                        year={year}
                        month={month}
                    />
                </div>
            </div>

            {/* Modals */}
            <HabitModal
                isOpen={isHabitModalOpen}
                onClose={() => setIsHabitModalOpen(false)}
                onSave={handleSaveHabit}
                initialData={editingHabit}
                mode={habitModalMode}
            />

            {selectedHabit && (
                <div className="fixed inset-0 z-50">
                    <CounterView
                        habit={selectedHabit}
                        onClose={() => {
                            setSelectedHabit(null);
                            fetchData(); // Refresh data to show updated counts
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
