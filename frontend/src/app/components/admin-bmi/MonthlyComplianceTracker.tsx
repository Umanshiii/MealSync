import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SchoolBMIStatus } from '../../types/bmiAdmin';

interface MonthlyComplianceTrackerProps {
  schools: SchoolBMIStatus[];
}

export default function MonthlyComplianceTracker({ schools }: MonthlyComplianceTrackerProps) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const fullyUpdated = schools.filter(s => s.currentMonthUpdated && s.completionPercentage === 100);
  const partiallyUpdated = schools.filter(s => s.currentMonthUpdated && s.completionPercentage < 100 && s.completionPercentage > 0);
  const notUpdated = schools.filter(s => !s.currentMonthUpdated || s.completionPercentage === 0);

  const overallCompliance = Math.round((fullyUpdated.length / schools.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl text-gray-800">Monthly Compliance Status</h2>
          <p className="text-sm text-gray-600">{currentMonth}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Compliance Rate</span>
          <span className="text-2xl text-blue-700">{overallCompliance}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              overallCompliance >= 90
                ? 'bg-green-500'
                : overallCompliance >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${overallCompliance}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">Fully Updated</span>
          </div>
          <p className="text-2xl text-green-700">{fullyUpdated.length}</p>
          <p className="text-xs text-green-600 mt-1">100% BMI data submitted</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">Partially Updated</span>
          </div>
          <p className="text-2xl text-yellow-700">{partiallyUpdated.length}</p>
          <p className="text-xs text-yellow-600 mt-1">Incomplete submissions</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">Not Updated</span>
          </div>
          <p className="text-2xl text-red-700">{notUpdated.length}</p>
          <p className="text-xs text-red-600 mt-1">No data submitted</p>
        </div>
      </div>

      {notUpdated.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Critical:</strong> {notUpdated.length} school(s) have not submitted any BMI data for {currentMonth}.
          </p>
        </div>
      )}
    </div>
  );
}
