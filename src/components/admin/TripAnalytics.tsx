import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Bus as BusIcon,
    Clock,
    TrendingUp,
    AlertTriangle,
    History
} from 'lucide-react';
import type { Bus } from '@/types';

interface TripAnalyticsProps {
    buses: Bus[];
}

const TripAnalytics = ({ buses }: TripAnalyticsProps) => {
    // Generate mock analytics based on current buses
    const activeBuses = buses.filter(b => b.isActive).length;
    const delayedBuses = buses.filter(b => b.status === 'delayed').length;

    const statusData = [
        { name: 'On Time', value: buses.filter(b => b.status === 'on-time' || b.status === 'arriving').length },
        { name: 'Delayed', value: delayedBuses },
        { name: 'Not Running', value: buses.filter(b => b.status === 'not-started' || b.status === 'completed' || b.status === 'unavailable').length },
    ];

    const hourlyActivityData = [
        { hour: '06:00', active: 5, delayed: 0 },
        { hour: '08:00', active: 12, delayed: 2 },
        { hour: '10:00', active: 15, delayed: 4 },
        { hour: '12:00', active: 10, delayed: 1 },
        { hour: '14:00', active: 14, delayed: 3 },
        { hour: '16:00', active: 18, delayed: 5 },
        { hour: '18:00', active: 16, delayed: 2 },
        { hour: '20:00', active: 8, delayed: 0 },
    ];

    const COLORS = ['#10b981', '#f59e0b', '#64748b'];

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AnalyticsCard
                    title="Total Trips"
                    value={buses.length.toString()}
                    icon={History}
                    trend="+12% from last week"
                    color="blue"
                />
                <AnalyticsCard
                    title="Active Now"
                    value={activeBuses.toString()}
                    icon={BusIcon}
                    trend={`${activeBuses > 10 ? 'High' : 'Normal'} activity`}
                    color="green"
                />
                <AnalyticsCard
                    title="Avg. Delay"
                    value="8m"
                    icon={Clock}
                    trend="-2m improvement"
                    color="amber"
                />
                <AnalyticsCard
                    title="Critical Alerts"
                    value={delayedBuses.toString()}
                    icon={AlertTriangle}
                    trend="Requires attention"
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Activity Trends
                        </h3>
                        <select className="bg-secondary/50 border-none rounded-lg text-xs font-semibold px-2 py-1">
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyActivityData}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                                <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fleet Status Distribution */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Fleet Status</h3>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black">{buses.length}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Buses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AnalyticsCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend: string;
    color: 'blue' | 'green' | 'amber' | 'red';
}

const AnalyticsCard = ({ title, value, icon: Icon, trend, color }: AnalyticsCardProps) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className={`glass-card p-5 rounded-2xl border ${colorMap[color].split(' ')[2]}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
            </div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <p className="text-xs text-muted-foreground font-medium">{trend}</p>
        </div>
    );
};

export default TripAnalytics;
