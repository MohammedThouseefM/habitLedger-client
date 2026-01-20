import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDaysInMonth, getDayNumber, formatDateForAPI } from '../utils/dateHelpers';
import { calculateDailyCompletion } from '../utils/statsCalculator';

const MonthlyChart = ({ year, month, habits, logsMap }) => {
    const days = getDaysInMonth(year, month);

    const data = days.map((day) => {
        const dateStr = formatDateForAPI(day);
        const completion = calculateDailyCompletion(habits, logsMap, dateStr);

        return {
            day: getDayNumber(day),
            completion,
            date: dateStr,
        };
    });

    return (
        <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Monthly Completion</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion']}
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#f1f5f9' }}
                        cursor={{ fill: '#334155', opacity: 0.3 }}
                    />
                    <Bar
                        dataKey="completion"
                        fill="#14b8a6"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyChart;
