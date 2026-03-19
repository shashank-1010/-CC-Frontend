interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
  loading?: boolean;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
  rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', text: 'text-rose-600' },
};

export default function StatCard({ label, value, icon, color = 'blue', loading }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-6 w-10 bg-slate-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        )}
      </div>
    </div>
  );
}
