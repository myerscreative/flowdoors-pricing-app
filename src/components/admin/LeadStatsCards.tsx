'use client';

import { LeadStats } from '@/types/lead';

interface Props {
  stats: LeadStats;
}

export function LeadStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Total Leads */}
      <StatCard
        label="Total Leads"
        value={stats.total}
        icon="👥"
        trend="No change this week"
        trendType="neutral"
        variant="primary"
      />

      {/* Without Quotes */}
      <StatCard
        label="Without Quotes"
        value={stats.withoutQuotes}
        icon="⚠️"
        trend="Needs attention"
        trendType="warning"
        variant="warning"
      />

      {/* With Quotes */}
      <StatCard
        label="With Quotes"
        value={stats.withQuotes}
        icon="✅"
        trend={`${stats.total > 0 ? Math.round((stats.withQuotes / stats.total) * 100) : 0}% conversion`}
        trendType="neutral"
        variant="success"
      />

      {/* Unassigned */}
      <StatCard
        label="Unassigned"
        value={stats.unassigned}
        icon="❓"
        trend="Needs assignment"
        trendType="warning"
        variant="warning"
      />

      {/* New This Week */}
      <StatCard
        label="New This Week"
        value={stats.newThisWeek}
        icon="📅"
        trend="Track weekly trends"
        trendType="neutral"
        variant="default"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  trendType,
  variant
}: {
  label: string;
  value: number;
  icon: string;
  trend: string;
  trendType: 'positive' | 'neutral' | 'negative' | 'warning';
  variant: 'primary' | 'success' | 'warning' | 'default';
}) {
  const variantStyles = {
    primary: 'before:bg-gradient-to-r before:from-[#00aeef] before:to-[#0099d4]',
    success: 'before:bg-gradient-to-r before:from-[#8dc63f] before:to-[#7bb03a]',
    warning: 'before:bg-gradient-to-r before:from-amber-500 before:to-orange-600',
    default: 'before:bg-gradient-to-r before:from-gray-300 before:to-gray-300',
  };

  const iconStyles = {
    primary: 'bg-gradient-to-br from-[#00aeef]/10 to-[#00aeef]/5 text-[#00aeef]',
    success: 'bg-gradient-to-br from-[#8dc63f]/10 to-[#8dc63f]/5 text-[#8dc63f]',
    warning: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600',
    default: 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600',
  };

  const trendStyles = {
    positive: 'text-[#8dc63f]',
    neutral: 'text-gray-600',
    negative: 'text-red-500',
    warning: 'text-amber-600',
  };

  return (
    <div className={`
      relative bg-white rounded-2xl p-6 border border-gray-200
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      before:absolute before:top-0 before:left-0 before:right-0 before:h-1
      before:rounded-t-2xl ${variantStyles[variant]}
    `}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>

      <div className="text-5xl font-bold text-[#2e2e2e] mb-2">
        {value}
      </div>

      <div className={`flex items-center gap-2 text-sm font-semibold ${trendStyles[trendType]}`}>
        <span>{getTrendIcon(trendType)}</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}

function getTrendIcon(type: string) {
  switch (type) {
    case 'positive': return '↑';
    case 'negative': return '↓';
    case 'warning': return '⚡';
    default: return '→';
  }
}
