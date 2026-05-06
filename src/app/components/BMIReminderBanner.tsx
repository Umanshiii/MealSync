import { AlertTriangle, AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

export type BMIStatus = 'PENDING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';

interface BMIReminderBannerProps {
  status: BMIStatus;
  pendingCount: number;
  overdueCount: number;
  criticalStudents: string[];
  onNavigateToBMI: () => void;
}

export default function BMIReminderBanner({
  status,
  pendingCount,
  overdueCount,
  criticalStudents,
  onNavigateToBMI,
}: BMIReminderBannerProps) {
  if (status === 'COMPLETED' && overdueCount === 0 && criticalStudents.length === 0) {
    return null;
  }

  const getStatusConfig = () => {
    if (overdueCount > 0) {
      return {
        icon: <AlertTriangle className="w-6 h-6" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        title: '⚠️ CRITICAL: Overdue BMI Updates Required',
        message: `${overdueCount} student(s) have overdue BMI data from last month. Immediate action required.`,
        buttonColor: 'bg-red-600 hover:bg-red-700',
      };
    }

    if (status === 'DUE_SOON') {
      return {
        icon: <AlertCircle className="w-6 h-6" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        title: '⏰ BMI Update Deadline Approaching',
        message: `${pendingCount} student(s) pending BMI data. Please update before month end (2 days remaining).`,
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
      };
    }

    if (status === 'PENDING' && pendingCount > 0) {
      return {
        icon: <AlertCircle className="w-6 h-6" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        title: 'ℹ️ Monthly BMI Update Pending',
        message: `${pendingCount} student(s) need BMI data for this month.`,
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      };
    }

    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-4 mb-6 shadow-md`}>
      <div className="flex items-start gap-4">
        <div className={config.iconColor}>{config.icon}</div>

        <div className="flex-1">
          <h3 className={`${config.textColor} mb-2`}>{config.title}</h3>
          <p className={`text-sm ${config.textColor} mb-3`}>{config.message}</p>

          {criticalStudents.length > 0 && (
            <div className="mb-3 p-3 bg-white border border-red-300 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">Students Requiring Immediate Attention:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {criticalStudents.map((student, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                  >
                    {student}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onNavigateToBMI}
            className={`px-4 py-2 ${config.buttonColor} text-white rounded-lg transition-all text-sm`}
          >
            Update BMI Data Now
          </button>
        </div>

        {status === 'OVERDUE' && (
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs h-fit">
            MANDATORY
          </div>
        )}
      </div>

      {overdueCount > 0 && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-xs text-red-700">
            <strong>Note:</strong> BMI tracking is mandatory for all students. Dashboard insights may be restricted until updates are completed.
          </p>
        </div>
      )}
    </div>
  );
}
