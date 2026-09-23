import { AlertTriangle, AlertCircle } from 'lucide-react';

interface AlertBannerProps {
  type: 'reminder' | 'warning';
  message: string;
  schoolCount?: number;
}

export default function AlertBanner({ type, message, schoolCount }: AlertBannerProps) {
  const config =
    type === 'warning'
      ? {
          bg: 'bg-red-50',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
        }
      : {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: <AlertCircle className="w-6 h-6 text-yellow-600" />,
        };

  return (
    <div className={`${config.bg} border-l-4 ${config.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <p className={`${config.text}`}>{message}</p>
          {schoolCount !== undefined && schoolCount > 0 && (
            <p className={`text-sm ${config.text} mt-1`}>
              <strong>{schoolCount}</strong> school(s) affected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
