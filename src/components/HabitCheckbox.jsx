import React from 'react';
import { Check } from 'lucide-react';

const HabitCheckbox = ({ checked, onChange, color = '#14b8a6', disabled = false, pending = false }) => {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`habit-checkbox ${checked ? 'checked' : ''} ${pending ? 'pending' : ''}`}
            style={{
                borderColor: checked ? color : '#cbd5e1',
                backgroundColor: checked ? color : 'white',
                opacity: pending ? 0.7 : 1,
            }}
            aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
            title={pending ? 'Syncing...' : ''}
        >
            {checked && <Check className="w-4 h-4" strokeWidth={3} />}
        </button>
    );
};

export default HabitCheckbox;
