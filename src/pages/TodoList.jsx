import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, ListTodo } from 'lucide-react';
import api from '../utils/api';
import TodoItem from '../components/todo/TodoItem';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await api.get('/api/todos');
            setTodos(response.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const response = await api.post('/api/todos', { text: newTodo });
            setTodos([response.data, ...todos]);
            setNewTodo('');
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const handleToggleTodo = async (todo) => {
        // Optimistic update
        const updatedTodos = todos.map(t =>
            t._id === todo._id ? { ...t, completed: !t.completed } : t
        );
        setTodos(updatedTodos);

        try {
            await api.put(`/api/todos/${todo._id}`, { completed: !todo.completed });
        } catch (error) {
            console.error('Error updating todo:', error);
            // Revert on error
            fetchTodos();
        }
    };

    const handleDeleteTodo = async (id) => {
        if (!window.confirm('Delete this task?')) return;

        // Optimistic update
        setTodos(todos.filter(t => t._id !== id));

        try {
            await api.delete(`/api/todos/${id}`);
        } catch (error) {
            console.error('Error deleting todo:', error);
            // Revert on error
            fetchTodos();
        }
    };

    // Calculate stats
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text mb-1">To-Do List</h1>
                        <p className="text-text-secondary">Track your daily tasks and ideas</p>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm min-w-[200px]">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                                <circle
                                    cx="24" cy="24" r="20"
                                    stroke="var(--color-primary)"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={126}
                                    strokeDashoffset={126 - (126 * progress) / 100}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-xs font-bold text-text">{progress}%</span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Completed</p>
                            <p className="text-lg font-bold text-text">{completed} <span className="text-sm text-text-secondary font-medium">/ {total} tasks</span></p>
                        </div>
                    </div>
                </div>

                {/* Add Task Input */}
                <form onSubmit={handleAddTodo} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Plus className="h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="w-full pl-11 pr-4 py-4 bg-white border border-border rounded-2xl text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-lg"
                    />
                    <button
                        type="submit"
                        disabled={!newTodo.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary-dark text-white px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </form>

                {/* Task List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="loading-spinner mx-auto mb-4"></div>
                            <p className="text-text-secondary">Loading tasks...</p>
                        </div>
                    ) : todos.length === 0 ? (
                        <div className="text-center py-12 bg-white/50 border border-dashed border-border rounded-2xl">
                            <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
                                <ListTodo className="w-8 h-8 text-text-secondary/50" />
                            </div>
                            <h3 className="text-lg font-medium text-text mb-1">No tasks yet</h3>
                            <p className="text-text-secondary">Add a task above to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {todos.map(todo => (
                                <TodoItem
                                    key={todo._id}
                                    todo={todo}
                                    onToggle={handleToggleTodo}
                                    onDelete={handleDeleteTodo}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Tasks Separator (Optional features for later: Filter tabs) */}
                {todos.some(t => t.completed) && todos.some(t => !t.completed) && (
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-bg px-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Completed</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoList;
