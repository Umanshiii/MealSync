import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationActionBarProps {
  nonCompliantCount: number;
  partiallyCompliantCount: number;
  totalSchools: number;
}

export default function NotificationActionBar({
  nonCompliantCount,
  partiallyCompliantCount,
  totalSchools,
}: NotificationActionBarProps) {
  const handleSendReminder = (target: 'all' | 'non-compliant' | 'partial') => {
    let message = '';

    switch (target) {
      case 'all':
        message = `Reminder sent to all ${totalSchools} schools`;
        break;
      case 'non-compliant':
        message = `Reminder sent to ${nonCompliantCount} non-compliant schools`;
        break;
      case 'partial':
        message = `Reminder sent to ${partiallyCompliantCount} partially compliant schools`;
        break;
    }

    toast.success(message);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg text-gray-800">Send Reminders</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleSendReminder('all')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Send className="w-4 h-4" />
          All Schools ({totalSchools})
        </button>

        <button
          onClick={() => handleSendReminder('non-compliant')}
          disabled={nonCompliantCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Non-Compliant ({nonCompliantCount})
        </button>

        <button
          onClick={() => handleSendReminder('partial')}
          disabled={partiallyCompliantCount === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Partial ({partiallyCompliantCount})
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Reminders will be sent as in-app notifications. Email integration coming soon.
      </p>
    </div>
  );
}
