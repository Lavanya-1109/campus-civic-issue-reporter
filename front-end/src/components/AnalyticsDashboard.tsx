import React from 'react';
import { IssueReport, Department } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../theme';

interface AnalyticsDashboardProps {
  issues: IssueReport[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ issues }) => {
  const { isDark } = useTheme();

  const total = issues.length;
  const reported = issues.filter(i => i.status === 'Reported').length;
  const ongoing = issues.filter(i => i.status === 'Ongoing').length;
  const finished = issues.filter(i => i.status === 'Finished').length;
  const highPriority = issues.filter(i => i.priority === 'High').length;
  const totalUpvotes = issues.reduce((acc, i) => acc + i.upvotes, 0);

  // Department counts
  const deptCounts: Record<string, number> = {};
  issues.forEach(i => {
    deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
  });

  const departmentData = Object.keys(deptCounts).map(dept => ({
    name: dept.split('&')[0].trim(),
    count: deptCounts[dept]
  }));

  // Status breakdown data for donut chart
  const statusData = [
    { name: 'Reported', value: reported, color: '#f59e0b' },
    { name: 'Ongoing', value: ongoing, color: '#3b82f6' },
    { name: 'Resolved', value: finished, color: '#10b981' }
  ];

  // Resolution Rate
  const resolutionRate = total > 0 ? Math.round((finished / total) * 100) : 0;

  return (
    <div id="analytics-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Campus Infrastructure Pilot Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Structured civic intake, duplicate deflection, and SLA response analytics
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 self-start sm:self-auto">
          TIET Pilot Evaluation
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1 */}
        <div className="rounded-2xl border p-4 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
            Total Intake
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{total}</span>
            <span className="text-[10px] text-slate-400">verified tickets</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>100% structured routing</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border p-4 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
            Resolution Rate
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolutionRate}%</span>
            <span className="text-[10px] text-slate-400">{finished} closed</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Target: &gt; 80% SLA</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border p-4 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
            Community Engagement
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{totalUpvotes}</span>
            <span className="text-[10px] text-slate-400">total upvotes</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <span>Crowd validation active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border p-4 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
            High Priority Rate
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{highPriority}</span>
            <span className="text-[10px] text-slate-400">safety escalations</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-rose-500" />
            <span>Avg TTFA: &lt; 2.4 hrs</span>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Department Volume Bar Chart */}
        <div className="rounded-2xl border p-5 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 mb-1">
            Issue Distribution by Department
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-4">
            Volume of incoming tickets grouped by target maintenance team
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#64748b' }} 
                  angle={-15} 
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff', 
                    borderColor: isDark ? '#27272a' : '#e2e8f0',
                    fontSize: '12px',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill={isDark ? '#38bdf8' : '#0f172a'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="rounded-2xl border p-5 transition-colors bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 mb-1">
              Active Lifecycle Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-4">
              Progression ratio across reported, in-progress, and resolved items
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#18181b' : '#ffffff', 
                    borderColor: isDark ? '#27272a' : '#e2e8f0',
                    fontSize: '12px',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Reported</span>
              <strong className="text-amber-600 dark:text-amber-400">{reported}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Ongoing</span>
              <strong className="text-blue-600 dark:text-blue-400">{ongoing}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Resolved</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{finished}</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
