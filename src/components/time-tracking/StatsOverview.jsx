import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const StatsOverview = ({ activities, date }) => {
    // Calculate stats
    const totalMinutes = activities.reduce((acc, curr) => {
        const start = new Date(curr.start_time);
        const end = new Date(curr.end_time);
        return acc + (end - start) / (1000 * 60);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    // Prepare chart data
    const chartData = React.useMemo(() => {
        const map = {};
        activities.forEach(a => {
            const start = new Date(a.start_time);
            const end = new Date(a.end_time);
            const duration = (end - start) / (1000 * 60);
            // Group by parent name or own name if no parent
            // ideally we would want the top-level name here.
            // For now let's assume flat list or passed in processed list,
            // but the prop says 'activities', usually raw.
            // Let's use name directly for simplicity, or we can improve grouping later.
            if (map[a.name]) {
                map[a.name] += duration;
            } else {
                map[a.name] = duration;
            }
        });
        return Object.keys(map)
            .map(name => ({ name, value: map[name] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 only
    }, [activities]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-2 shadow-lg rounded-lg border border-border text-xs text-text">
                    <p className="font-semibold mb-0.5">{payload[0].name}</p>
                    <p className="text-text-secondary">
                        {Math.floor(payload[0].value / 60)}h {Math.round(payload[0].value % 60)}m
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Total Time Card */}
            <div className="p-2 relative overflow-hidden transition-all">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        <span>Total Tracked</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6 justify-center">
                        <span className="text-5xl font-bold text-text">{hours}</span>
                        <span className="text-text-secondary font-medium">hrs</span>
                        <span className="text-5xl font-bold text-text ml-4">{minutes}</span>
                        <span className="text-text-secondary font-medium">mins</span>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 text-sm text-primary-dark bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">Productive Day</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution Chart */}
            {chartData.length > 0 && (
                <div className="bg-white border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm mt-4">
                    <h3 className="text-text font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Activity Distribution
                    </h3>
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-text-secondary opacity-20">
                                {Math.round((totalMinutes / 1440) * 100)}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 mt-2">
                        {chartData.slice(0, 3).map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between text-sm group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full ring-2 ring-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-text-secondary truncate max-w-[120px]">{item.name}</span>
                                </div>
                                <span className="font-medium text-text bg-surface-light px-2 py-0.5 rounded group-hover:bg-surface transition-colors">
                                    {Math.floor(item.value / 60)}h {Math.round(item.value % 60)}m
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsOverview;
