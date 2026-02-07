import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import TimelineView from '../components/time-tracking/TimelineView';
import StatsOverview from '../components/time-tracking/StatsOverview';

const TimeTracking = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        start_time: '09:00',
        end_time: '10:00',
        description: '',
        color: '#3b82f6'
    });

    useEffect(() => {
        fetchActivities();
    }, [selectedDate]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const [activitiesRes, habitsRes] = await Promise.all([
                api.get(`/api/activities?date=${selectedDate}`),
                api.get('/api/habits')
            ]);

            // Format habits as "reminders" for the timeline
            const reminders = habitsRes.data
                .filter(habit => habit.reminder_time)
                .map(habit => {
                    const start = `${selectedDate}T${habit.reminder_time}:00`;
                    // Create a 30 min block for visibility
                    const [hours, minutes] = habit.reminder_time.split(':').map(Number);
                    const endDate = new Date(selectedDate);
                    endDate.setHours(hours, minutes + 30);
                    const end = endDate.toLocaleTimeString('en-CA', { hour12: false }).slice(0, 5); // HH:MM

                    return {
                        id: `reminder-${habit.id}`,
                        name: `🔔 ${habit.name}`,
                        start_time: start,
                        end_time: `${selectedDate}T${end}:00`,
                        description: `Daily reminder for ${habit.name}`,
                        color: habit.color,
                        isReminder: true // Flag to distinguish
                    };
                });

            setActivities([...activitiesRes.data, ...reminders]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (delta) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + delta);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create Date objects from local parts and convert to UTC ISO string
            const [year, month, day] = selectedDate.split('-').map(Number);
            const [startHour, startMinute] = formData.start_time.split(':').map(Number);
            const [endHour, endMinute] = formData.end_time.split(':').map(Number);

            // Month is 0-indexed in JS Date constructor
            const startDateTime = new Date(year, month - 1, day, startHour, startMinute).toISOString();
            const endDateTime = new Date(year, month - 1, day, endHour, endMinute).toISOString();

            const payload = {
                name: formData.name,
                start_time: startDateTime,
                end_time: endDateTime,
                description: formData.description,
                color: formData.color
            };

            if (editingId) {
                await api.put(`/api/activities/${editingId}`, payload);
            } else {
                await api.post('/api/activities', payload);
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({
                name: '',
                start_time: '09:00',
                end_time: '10:00',
                description: ''
            });
            fetchActivities();
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Failed to save activity');
        }
    };

    const handleEdit = (activity) => {
        const startDate = new Date(activity.start_time);
        const endDate = new Date(activity.end_time);

        setFormData({
            name: activity.name,
            start_time: startDate.toTimeString().slice(0, 5),
            end_time: endDate.toTimeString().slice(0, 5),
            description: activity.description || '',
            color: activity.color || '#3b82f6'
        });
        setEditingId(activity.id);
        setShowForm(true);
    };

    const handleAdd = (initialData = {}) => {
        setEditingId(null);
        setFormData({
            name: '',
            start_time: initialData.hour
                ? `${initialData.hour.toString().padStart(2, '0')}:00`
                : '09:00',
            end_time: initialData.hour
                ? `${(initialData.hour + 1).toString().padStart(2, '0')}:00`
                : '10:00',
            description: '',
            color: '#3b82f6'
        });
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!editingId || !window.confirm('Are you sure you want to delete this activity?')) return;
        try {
            await api.delete(`/api/activities/${editingId}`);
            fetchActivities();
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-text-secondary hover:text-text transition-colors flex items-center gap-1 text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold text-text mb-1">Time Tracking</h1>
                        <p className="text-text-secondary">Manage your daily schedule and productivity</p>
                    </div>

                    <div className="flex items-center bg-surface rounded-xl border border-border p-1 shadow-sm self-start">
                        <button
                            onClick={() => handleDateChange(-1)}
                            className="p-2 hover:bg-surface-light rounded-lg text-text-secondary hover:text-text transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 px-4 py-1 border-x border-border mx-1 min-w-[160px] justify-center">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-text focus:outline-none cursor-pointer text-center"
                            />
                        </div>
                        <button
                            onClick={() => handleDateChange(1)}
                            className="p-2 hover:bg-surface-light rounded-lg text-text-secondary hover:text-text transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm h-[600px] flex flex-col">
                            {/* Timeline Header - Dark stripe from screenshot */}
                            <div className="h-10 bg-slate-500 flex items-center justify-between px-4 text-white/90 text-sm font-medium shrink-0">
                                <span>Timeline</span>
                                <span className="text-white/60 text-xs">1h = 60px</span>
                            </div>
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : (
                                <TimelineView
                                    activities={activities}
                                    onEdit={handleEdit}
                                    onAdd={handleAdd}
                                    selectedDate={selectedDate}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: Stats & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <button
                            onClick={() => handleAdd()}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} />
                            Log Activity
                        </button>

                        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />

                            <StatsOverview activities={activities} date={selectedDate} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
                            <div>
                                <h2 className="text-lg font-bold text-text">
                                    {editingId ? 'Edit Activity' : 'New Activity'}
                                </h2>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-text-secondary hover:text-text w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-light transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Name & Color */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activity Name & Color</label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="What are you working on?"
                                            className="input-premium w-full text-lg font-medium placeholder:font-normal py-3"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                className={`w-6 h-6 rounded-full transition-all border-2 ${formData.color === color ? 'border-white scale-110 shadow-sm' : 'border-transparent hover:scale-110'}`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Time & Date */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="input-premium w-full pl-9 font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        className="bg-white text-text border border-slate-200 rounded-xl px-3 py-2 w-full font-mono text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        className="bg-white text-text border border-slate-200 rounded-xl px-3 py-2 w-full font-mono text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Add notes, goals, or details..."
                                    className="input-premium w-full h-24 resize-none text-sm py-3"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="mr-auto text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Delete Activity
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {editingId ? 'Save Changes' : 'Create Activity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeTracking;
