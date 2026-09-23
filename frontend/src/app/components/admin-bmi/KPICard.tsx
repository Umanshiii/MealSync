import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    text: 'text-green-800',
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    text: 'text-red-800',
  },
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-800',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    text: 'text-purple-800',
  },
};

export default function KPICard({ title, value, icon: Icon, color, subtitle }: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`${colors.bg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <span className={`text-3xl ${colors.text}`}>{value}</span>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
