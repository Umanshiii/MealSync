export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Non-Compliant';

interface ComplianceStatusBadgeProps {
  status: ComplianceStatus;
  percentage?: number;
}

export default function ComplianceStatusBadge({ status, percentage }: ComplianceStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Compliant':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: '✓',
        };
      case 'Partially Compliant':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: '⚠',
        };
      case 'Non-Compliant':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: '✕',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-1 rounded-full text-xs border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon} {status}
      </span>
      {percentage !== undefined && (
        <span className="text-sm text-gray-600">{percentage}%</span>
      )}
    </div>
  );
}
