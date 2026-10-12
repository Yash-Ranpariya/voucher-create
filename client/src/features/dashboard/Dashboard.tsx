import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../app/providers/AuthProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { CountUp } from '../../components/ui/CountUp';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

const COLOR_REGISTRY: Record<string, { color: string; label: string; icon: string }> = {
  // Expense Categories
  TRAVEL: { color: '#3B82F6', label: 'Travel & Commute', icon: '✈️' },
  FOOD: { color: '#F59E0B', label: 'Food & Meals', icon: '🍔' },
  ACCOMMODATION: { color: '#8B5CF6', label: 'Accommodation / Hotel', icon: '🏨' },
  OFFICE_SUPPLIES: { color: '#06B6D4', label: 'Office Supplies', icon: '📎' },
  SOFTWARE: { color: '#6366F1', label: 'Software & IT Tools', icon: '💻' },
  TRAINING: { color: '#10B981', label: 'Training & Courses', icon: '🎓' },
  OTHER: { color: '#64748B', label: 'Other Expenses', icon: '📦' },

  // Voucher Statuses
  PENDING_APPROVAL: { color: '#F59E0B', label: 'Pending Approval', icon: '⏳' },
  PENDING_ACCOUNTS_VERIFICATION: { color: '#3B82F6', label: 'Accounts Verification', icon: '🔍' },
  APPROVED: { color: '#10B981', label: 'Approved Vouchers', icon: '✅' },
  REJECTED: { color: '#EF4444', label: 'Rejected Vouchers', icon: '❌' },
  DRAFT: { color: '#94A3B8', label: 'Draft Vouchers', icon: '📝' },
  PAID: { color: '#059669', label: 'Paid Vouchers', icon: '💰' },

  // Departments
  Engineering: { color: '#3B82F6', label: 'Engineering', icon: '⚡' },
  Marketing: { color: '#EC4899', label: 'Marketing', icon: '📢' },
  Sales: { color: '#F59E0B', label: 'Sales', icon: '📈' },
  HR: { color: '#8B5CF6', label: 'Human Resources', icon: '👥' },
  Finance: { color: '#10B981', label: 'Finance & Accounts', icon: '💳' },
  Operations: { color: '#14B8A6', label: 'Operations', icon: '⚙️' },
};

const FALLBACK_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#64748B'];

const getLegendItem = (key: string, index: number = 0) => {
  if (COLOR_REGISTRY[key]) return COLOR_REGISTRY[key];
  return {
    color: FALLBACK_PALETTE[index % FALLBACK_PALETTE.length],
    label: key ? key.replace(/_/g, ' ') : `Item ${index + 1}`,
    icon: '📊'
  };
};

export const Dashboard = () => {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data.data;
    }
  });

  const roleLabels: any = {
    EMPLOYEE: {
      stat1: { label: 'Pending Approval', key: 'pending', icon: Clock, bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white' },
      stat2: { label: 'Approved Vouchers', key: 'approved', icon: CheckCircle, bg: 'bg-gradient-to-br from-indigo-400 to-purple-600', text: 'text-white' },
      stat3: { label: 'Rejected Vouchers', key: 'rejected', icon: FileText, bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-white' },
      stat4: { label: 'Total Amount', key: 'totalAmount', icon: DollarSign, bg: 'bg-gradient-to-br from-rose-400 to-orange-500', text: 'text-white', isCurrency: true }
    },
    DIRECTOR: {
      stat1: { label: 'Pending Approvals', key: 'pending', icon: Clock, bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white' },
      stat2: { label: 'Total Approved', key: 'approved', icon: CheckCircle, bg: 'bg-gradient-to-br from-indigo-400 to-purple-600', text: 'text-white' },
      stat3: { label: 'Total Rejections', key: 'rejected', icon: FileText, bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-white' },
      stat4: { label: 'Total Amount Approved', key: 'totalAmount', icon: DollarSign, bg: 'bg-gradient-to-br from-rose-400 to-orange-500', text: 'text-white', isCurrency: true }
    },
    ACCOUNTS: {
      stat1: { label: 'Total Approved', key: 'approved', icon: CheckCircle, bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white' },
      stat2: { label: 'Total Pending', key: 'pending', icon: Clock, bg: 'bg-gradient-to-br from-indigo-400 to-purple-600', text: 'text-white' },
      stat3: { label: 'Total Paid', key: 'approved', icon: FileText, bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', text: 'text-white' },
      stat4: { label: 'Total Amount Approved', key: 'totalAmount', icon: DollarSign, bg: 'bg-gradient-to-br from-rose-400 to-orange-500', text: 'text-white', isCurrency: true }
    }
  };

  const labels = roleLabels[user?.role || 'EMPLOYEE'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const stats = data.stats;
  const chartData = data.chartData;
  const recentActivity = data.recentActivity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-['Plus_Jakarta_Sans']">Overview</h1>
        <p className="text-[var(--text-secondary)]">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['stat1', 'stat2', 'stat3', 'stat4'].map((key) => {
          const config = labels[key];
          const Icon = config.icon;
          return (
            <div 
              key={key} 
              className={`relative overflow-hidden rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/40 group transition-transform duration-300 hover:-translate-y-1 ${config.bg}`}
            >
              {/* Inner Glow / Starburst Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.3)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" style={{ animationDuration: '4s' }} />
              
              <div className="absolute -right-4 -bottom-4 p-4 opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none">
                <Icon className="w-24 h-24 text-white" />
              </div>
              
              <div className="relative z-10">
                <p className={`text-sm font-medium mb-3 opacity-90 tracking-wide ${config.text}`}>{config.label}</p>
                <h3 className={`text-3xl font-bold font-mono tracking-tight ${config.text} drop-shadow-md`}>
                  <CountUp end={stats[config.key] || 0} prefix={config.isCurrency ? '₹' : ''} />
                </h3>
              </div>
              
              {/* Fake "Credit Card" style chip / active indicator */}
              <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs font-semibold text-white shadow-sm">
                  Active
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2 flex flex-col min-h-[460px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">Distribution Summary</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {user?.role === 'DIRECTOR' ? 'Vouchers grouped by Approval Status' : user?.role === 'ACCOUNTS' ? 'Approved expenses by Department' : 'Expense breakdown by Category'}
              </p>
            </div>
            {chartData && chartData.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Total: {user?.role === 'DIRECTOR' ? `${chartData.reduce((a: number, b: any) => a + b.value, 0)} Vouchers` : `₹${chartData.reduce((a: number, b: any) => a + b.value, 0).toLocaleString()}`}
              </span>
            )}
          </div>

          <div className="w-full flex-1">
            {chartData && chartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Donut Chart with Center Total */}
                <div className="md:col-span-6 relative flex items-center justify-center" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {chartData.map((entry: any, index: number) => {
                          const itemInfo = getLegendItem(entry.name, index);
                          return <Cell key={`cell-${index}`} fill={itemInfo.color} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid rgba(255, 255, 255, 0.15)', 
                          borderRadius: '12px', 
                          color: '#F8FAFC', 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' 
                        }}
                        itemStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                        formatter={(value: any, name: any) => {
                          const item = getLegendItem(name);
                          const formattedVal = user?.role === 'DIRECTOR' ? `${value} Vouchers` : `₹${Number(value).toLocaleString()}`;
                          return [formattedVal, `${item.icon} ${item.label}`];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center of Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
                    <span className="text-base font-bold font-mono text-white">
                      {user?.role === 'DIRECTOR' ? chartData.reduce((a: number, b: any) => a + b.value, 0) : `₹${chartData.reduce((a: number, b: any) => a + b.value, 0).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Right: Detailed Color Legend & Category Breakdown */}
                <div className="md:col-span-6 space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Color Guide & Breakdown</p>
                  <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {(() => {
                      const totalVal = chartData.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;
                      return chartData.map((entry: any, index: number) => {
                        const item = getLegendItem(entry.name, index);
                        const pct = Math.round((entry.value / totalVal) * 100);
                        const formattedVal = user?.role === 'DIRECTOR' ? `${entry.value} Vouchers` : `₹${Number(entry.value).toLocaleString()}`;

                        return (
                          <div 
                            key={entry.name || index}
                            className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-slate-800/50 hover:bg-slate-800/80 shadow-xs transition-all flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/40" 
                                  style={{ backgroundColor: item.color }} 
                                />
                                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                                  <span>{item.icon}</span>
                                  <span>{item.label}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-200">{formattedVal}</span>
                                <span 
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-xs"
                                  style={{ backgroundColor: item.color }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>

                            {/* Mini progress bar showing proportion */}
                            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%`, backgroundColor: item.color }} 
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No Data" description="Not enough data to display the chart." />
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act: any) => (
                <div key={act.id} className="relative pl-6 pb-4 border-l border-[var(--border)] last:border-0 last:pb-0">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[var(--accent-secondary)] ring-4 ring-white" />
                  <p className="text-sm text-[var(--text-primary)] mb-1">
                    <span className="font-medium">{act.action}</span> - {act.voucher.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(act.created_at).toLocaleString()} • {act.voucher.voucher_number}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title="No Activity" description="No recent activities found." />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
