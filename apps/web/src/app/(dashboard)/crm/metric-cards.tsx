'use client';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: number;
  trendLabel?: string;
  accentColor: 'blue' | 'green' | 'purple' | 'red';
  pulse?: boolean;
}

const accentStyles = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    border: 'border-purple-100',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    border: 'border-red-100',
  },
};

function MetricCard({ icon, label, value, trend, accentColor, pulse }: MetricCardProps) {
  const styles = accentStyles[accentColor];
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-emerald-600' : 'text-red-500';

  return (
    <div
      className={`relative rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}>
          <span className={styles.iconColor}>{icon}</span>
        </div>
        {pulse && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          {typeof value === 'number' ? value.toLocaleString('nl-NL') : value}
        </p>
      </div>
      <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
        {isPositive ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 5 5M7 7l5 5 5-5" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-5 5-5-5m0 10l5-5 5 5" />
          </svg>
        )}
        <span>
          {isPositive ? '+' : ''}
          {trend}%
        </span>
        <span className="text-gray-400">vs vorige week</span>
      </div>
    </div>
  );
}

// --- Icons ---
function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
    </svg>
  );
}

// --- Main Export ---
interface MetricCardsProps {
  metrics: {
    totalUsers: number;
    onlineNow: number;
    newThisWeek: number;
    churnRate: number;
    trends: {
      totalUsers: number;
      onlineNow: number;
      newThisWeek: number;
      churnRate: number;
    };
  };
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<UsersIcon />}
        label="Totaal gebruikers"
        value={metrics.totalUsers}
        trend={metrics.trends.totalUsers}
        accentColor="blue"
      />
      <MetricCard
        icon={
          <span className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
        }
        label="Online nu"
        value={metrics.onlineNow}
        trend={metrics.trends.onlineNow}
        accentColor="green"
        pulse
      />
      <MetricCard
        icon={<TrendingUpIcon />}
        label="Nieuwe deze week"
        value={metrics.newThisWeek}
        trend={metrics.trends.newThisWeek}
        accentColor="purple"
      />
      <MetricCard
        icon={<TrendingDownIcon />}
        label="Churn rate"
        value={`${metrics.churnRate}%`}
        trend={metrics.trends.churnRate}
        accentColor="red"
      />
    </div>
  );
}
