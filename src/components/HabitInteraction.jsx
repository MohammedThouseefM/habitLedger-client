import { Check } from 'lucide-react';

const HabitInteraction = ({ habit, log, dateStr, onUpdate, onClick }) => {

    // Check if partial completion
    const isCompleted = log?.completed;
    const currentVal = log?.current_value || 0;
    const progress = habit.target_value > 0 ? Math.min((currentVal / habit.target_value) * 100, 100) : 0;

    const handleBooleanToggle = () => {
        onUpdate({ habitId: habit.id, date: dateStr, value: isCompleted ? 0 : 1 });
    };

    if (habit.type === 'boolean') {
        return (
            <button
                onClick={handleBooleanToggle}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isCompleted
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200 scale-100'
                    : 'bg-gray-100/50 text-gray-300 hover:bg-gray-200 hover:scale-110'
                    }`}
            >
                <Check className={`w-5 h-5 transition-transform duration-300 ${isCompleted ? 'scale-100 stroke-[3px]' : 'scale-75'}`} />
            </button>
        );
    }

    // For Count/Time - Open Premium Counter Modal
    return (
        <button
            onClick={onClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group ${isCompleted
                ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                : currentVal > 0
                    ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100'
                    : 'bg-gray-100/50 text-gray-300 hover:bg-gray-200 hover:scale-105'
                }`}
        >
            {isCompleted ? (
                <Check className="w-5 h-5 stroke-[3px]" />
            ) : (
                <span className="text-xs font-bold font-mono">{currentVal > 0 ? currentVal : '+'}</span>
            )}

            {/* Progress Ring or Bar */}
            {!isCompleted && currentVal > 0 && (
                <div
                    className="absolute bottom-0 left-0 h-1 bg-primary-500/50 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            )}
        </button>
    );
};

export default HabitInteraction;
