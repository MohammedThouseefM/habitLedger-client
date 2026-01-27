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
            <h3 className="text-lg font-semibold text-text mb-4">Monthly Completion</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        stroke="#cbd5e1"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        stroke="#cbd5e1"
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion']}
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            color: '#0f172a',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#0f172a' }}
                        cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
                    />
                    <Bar
                        dataKey="completion"
                        fill="var(--color-primary)"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyChart;
