import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '../utils/dateHelpers';

const MonthSelector = ({ year, month, onPrevious, onNext, compact = false }) => {
    const monthName = getMonthName(month);

    if (compact) {
        return (
            <div className="flex items-center gap-1">
                <button onClick={onPrevious} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-bold text-slate-200 min-w-[80px] text-center">
                    {monthName} {year}
                </div>
                <button onClick={onNext} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={onPrevious}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-primary-400"
                aria-label="Previous month"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center min-w-[120px]">
                <h2 className="text-xl font-bold text-white tracking-wide">
                    {monthName}
                </h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{year}</p>
            </div>

            <button
                onClick={onNext}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-primary-400"
                aria-label="Next month"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default MonthSelector;
