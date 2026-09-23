import { AlertTriangle, AlertCircle, TrendingDown, ArrowRight } from 'lucide-react';

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
    // RED SCALE: OVERDUE (Critical Urgency)
    if (overdueCount > 0) {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
        bgColor: 'bg-white',
        borderColor: 'border-red-500',
        textColor: 'text-[#334155]',
        iconBg: 'bg-red-50',
        title: '⚠️ CRITICAL: Overdue BMI Updates',
        message: `${overdueCount} student(s) have overdue BMI records. Immediate synchronization with the PM-POSHAN portal is required.`,
        buttonStyle: 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/10',
        badge: (
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase shadow-sm">
            Mandatory
          </div>
        )
      };
    }

    // AMBER SCALE: DUE SOON (High Urgency)
    if (status === 'DUE_SOON' || pendingCount > 0) {
      return {
        icon: <AlertCircle className="w-6 h-6 text-[#FF9933]" />,
        bgColor: 'bg-white',
        borderColor: 'border-[#FF9933]', 
        textColor: 'text-[#334155]',
        iconBg: 'bg-[#FFF4E5]',
        title: '⏰ Update Deadline Approaching',
        message: `${pendingCount} student(s) pending monthly updates. Complete profiles before the automated month-end lock.`,
        buttonStyle: 'bg-[#2C533A] text-white hover:bg-[#1E3B29] shadow-[#2C533A]/10',
        badge: (
          <div className="bg-[#FFF4E5] text-[#FF9933] border border-[#FF9933]/20 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase">
            Action Required
          </div>
        )
      };
    }

    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`${config.bgColor} border-l-[8px] ${config.borderColor} rounded-3xl p-6 lg:p-8 mb-6 shadow-sm border border-y-[#E2E8F0] border-r-[#E2E8F0] animate-in fade-in slide-in-from-top-4 duration-300`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        
        {/* Urgent Icon Backdrop */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}>
          {config.icon}
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-lg font-extrabold tracking-tight ${config.textColor}`}>
                {config.title}
              </h3>
              <p className="text-xs font-medium text-gray-400 mt-1 leading-relaxed">
                {config.message}
              </p>
            </div>
            <div className="flex-shrink-0 self-start sm:self-center">
              {config.badge}
            </div>
          </div>

          {/* Critical Students Highlight */}
          {criticalStudents.length > 0 && (
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#334155]/60">
                  Deficient Growth Records Tracked
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {criticalStudents.map((student, index) => (
                  <span key={index} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold">
                    {student}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onNavigateToBMI}
              className={`group flex items-center gap-2 px-6 py-3.5 ${config.buttonStyle} rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-md active:scale-98`}
            >
              Update BMI Data Now
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}