import React, { useState, useEffect } from 'react';
import { X, Check, Hash, Clock, Calendar } from 'lucide-react';

const HabitModal = ({ isOpen, onClose, onSave, initialData, mode = 'create' }) => {
    const initialFormState = {
        name: '',
        color: '#14b8a6',
        type: 'boolean', // boolean, count, time
        target_value: 1,
        unit: '',
        frequency_type: 'daily', // daily, specific_days, dates
        frequency_days: [1, 2, 3, 4, 5, 6, 0], // All days by default
        streak_tolerance: 0,
        reminder_time: '09:00',
        enable_reminder: false
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (initialData && mode === 'edit') {
                setFormData({
                    ...initialFormState,
                    ...initialData,
                    enable_reminder: !!initialData.reminder_time,
                    reminder_time: initialData.reminder_time || '09:00',
                    frequency_days: initialData.frequency_days || initialFormState.frequency_days
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, initialData, mode]);

    const colors = [
        '#14b8a6', // teal
        '#fb923c', // orange
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#ef4444', // red
    ];

    const weekDays = [
        { id: 1, label: 'M' },
        { id: 2, label: 'T' },
        { id: 3, label: 'W' },
        { id: 4, label: 'T' },
        { id: 5, label: 'F' },
        { id: 6, label: 'S' },
        { id: 0, label: 'S' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDay = (dayId) => {
        const currentDays = Array.isArray(formData.frequency_days) ? formData.frequency_days : [];
        if (currentDays.includes(dayId)) {
            handleInputChange('frequency_days', currentDays.filter(d => d !== dayId));
        } else {
            handleInputChange('frequency_days', [...currentDays, dayId]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSave({
                ...formData,
                name: formData.name.trim(),
                reminder_time: formData.enable_reminder ? formData.reminder_time : null
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-border">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface shrink-0 first-letter:rounded-t-2xl">
                    <h2 className="text-xl font-bold text-text">
                        {mode === 'edit' ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text hover:bg-surface-light p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Name & Color */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Name & Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Read Books, Gym"
                                    className="flex-1 input-premium"
                                    autoFocus
                                    required
                                />
                                <div className="flex gap-1.5 items-center bg-surface-light border border-border rounded-xl px-3 shadow-inner">
                                    {colors.slice(0, 5).map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => handleInputChange('color', color)}
                                            className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${formData.color === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Habit Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'boolean', label: 'Yes / No', icon: Check },
                                { id: 'count', label: 'Count', icon: Hash },
                                { id: 'time', label: 'Time', icon: Clock }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleInputChange('type', type.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.type === type.id
                                        ? 'border-primary bg-primary/20 text-primary-dark ring-1 ring-primary/30'
                                        : 'border-border bg-surface-light text-text-secondary hover:bg-surface hover:border-text-secondary'
                                        }`}
                                >
                                    <type.icon className={`w-6 h-6 mb-2 ${formData.type === type.id ? 'text-primary' : 'text-text-secondary'}`} />
                                    <span className="text-sm font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count/Time Details */}
                    {formData.type !== 'boolean' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Target</label>
                                <input
                                    type="number"
                                    value={formData.target_value}
                                    onChange={(e) => handleInputChange('target_value', parseInt(e.target.value) || 0)}
                                    className="input-premium"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Unit</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    placeholder={formData.type === 'time' ? 'mins' : 'items'}
                                    className="input-premium"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Reminder Time */}
                    <div className={`p-4 rounded-xl space-y-3 border transition-all ${formData.enable_reminder ? 'bg-amber-50 border-amber-200' : 'bg-surface-light border-border'}`}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                                <Clock className={`w-4 h-4 ${formData.enable_reminder ? 'text-amber-500' : 'text-text-secondary'}`} />
                                Daily Reminder
                            </label>
                            <button
                                type="button"
                                onClick={() => handleInputChange('enable_reminder', !formData.enable_reminder)}
                                className={`relative w-11 h-6 transition-colors rounded-full focus:outline-none flex items-center ${formData.enable_reminder ? 'bg-primary' : 'bg-slate-300'}`}
                            >
                                <span
                                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full shadow-sm ${formData.enable_reminder ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {formData.enable_reminder && (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
                                <input
                                    type="time"
                                    value={formData.reminder_time}
                                    onChange={(e) => handleInputChange('reminder_time', e.target.value)}
                                    className="bg-white border border-border text-text rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                                    required={formData.enable_reminder}
                                />
                                <span className="text-xs text-text-secondary">
                                    Notification time
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Frequency */}
                    <div className="bg-surface-light p-4 rounded-xl space-y-3 border border-border">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Frequency</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.frequency_type === 'daily' ? 'border-primary' : 'border-text-secondary'}`}>
                                    {formData.frequency_type === 'daily' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={formData.frequency_type === 'daily'}
                                    onChange={() => handleInputChange('frequency_type', 'daily')}
                                />
                                <span className="text-sm font-medium text-text group-hover:text-primary">Every Day</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.frequency_type === 'specific_days' ? 'border-primary' : 'border-text-secondary'}`}>
                                    {formData.frequency_type === 'specific_days' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={formData.frequency_type === 'specific_days'}
                                    onChange={() => handleInputChange('frequency_type', 'specific_days')}
                                />
                                <span className="text-sm font-medium text-text group-hover:text-primary">Specific Days</span>
                            </label>
                        </div>

                        {formData.frequency_type === 'specific_days' && (
                            <div className="flex justify-between gap-1 pt-2 animate-in fade-in">
                                {weekDays.map(day => (
                                    <button
                                        type="button"
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${formData.frequency_days?.includes(day.id)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                                            : 'bg-surface border border-border text-text-secondary hover:bg-surface-light hover:text-text'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-text-secondary hover:text-text hover:bg-surface-light rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {mode === 'edit' ? 'Save Changes' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HabitModal;
