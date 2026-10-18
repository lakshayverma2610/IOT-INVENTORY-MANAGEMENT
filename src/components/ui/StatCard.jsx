import Card3D from './Card3D';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  const colors = {
    blue: { bg: 'from-blue-500 to-blue-600', icon: 'text-white', badge: 'bg-blue-50 text-blue-600' },
    emerald: { bg: 'from-emerald-500 to-emerald-600', icon: 'text-white', badge: 'bg-emerald-50 text-emerald-600' },
    amber: { bg: 'from-amber-500 to-amber-600', icon: 'text-white', badge: 'bg-amber-50 text-amber-600' },
    red: { bg: 'from-red-500 to-red-600', icon: 'text-white', badge: 'bg-red-50 text-red-600' },
    purple: { bg: 'from-purple-500 to-purple-600', icon: 'text-white', badge: 'bg-purple-50 text-purple-600' },
    slate: { bg: 'from-slate-600 to-slate-700', icon: 'text-white', badge: 'bg-slate-50 text-slate-600' },
  };
  const c = colors[color] || colors.blue;

  return (
    <Card3D
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all ${
        onClick
          ? 'cursor-pointer hover:shadow-lg hover:border-slate-300 group'
          : 'cursor-default hover:shadow-md'
      }`}
    >
      <div onClick={onClick} className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
              {onClick && (
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              )}
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <Icon className={`w-6 h-6 ${c.icon}`} />
            </div>
          )}
        </div>
      </div>
    </Card3D>
  );
}
