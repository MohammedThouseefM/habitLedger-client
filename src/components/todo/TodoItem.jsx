import React from 'react';
import { Check, Trash2 } from 'lucide-react';

const TodoItem = ({ todo, onToggle, onDelete }) => {
    return (
        <div className="group flex items-center gap-3 p-3 bg-surface rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm">
            <button
                onClick={() => onToggle(todo)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${todo.completed
                        ? 'bg-primary border-primary text-white'
                        : 'bg-surface-light border-border text-transparent hover:border-primary'
                    }`}
            >
                <Check className="w-4 h-4" strokeWidth={3} />
            </button>

            <span className={`flex-1 text-sm font-medium transition-all ${todo.completed ? 'text-text-secondary line-through' : 'text-text'
                }`}>
                {todo.text}
            </span>

            <button
                onClick={() => onDelete(todo._id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Delete task"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

export default TodoItem;
