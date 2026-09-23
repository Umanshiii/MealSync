import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { SchoolBMIStatus } from '../../types/bmiAdmin';

interface EnforcementPanelProps {
  nonCompliantSchools: SchoolBMIStatus[];
}

export default function EnforcementPanel({ nonCompliantSchools }: EnforcementPanelProps) {
  if (nonCompliantSchools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl text-gray-800">Compliance Enforcement</h2>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-700 mb-2">✓ All Schools Compliant</p>
          <p className="text-sm text-gray-600">No enforcement actions required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-red-300">
      <div className="flex items-center gap-3 mb-4">
        <Lock className="w-6 h-6 text-red-600" />
        <h2 className="text-xl text-gray-800">Compliance Enforcement</h2>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-red-800 mb-2">Non-Compliant Schools Detected</h3>
            <p className="text-sm text-red-700 mb-3">
              {nonCompliantSchools.length} school(s) are marked as <strong>NON-COMPLIANT</strong> for failing to submit
              monthly BMI data.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm text-gray-700 mb-2">Enforcement Measures:</h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-800 mb-1">Public Compliance Status</h4>
              <p className="text-sm text-gray-600">
                Non-compliant schools are publicly marked with red status indicators across all dashboards
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100 p-2 rounded">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-800 mb-1">Automatic Notifications</h4>
              <p className="text-sm text-gray-600">
                Reminder notifications sent automatically to school administrators
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-800 mb-1">Report Submission Restriction</h4>
              <p className="text-sm text-gray-600">
                Schools cannot submit meal quality reports until BMI compliance is achieved (Optional - can be enabled)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Non-compliant schools will remain restricted until they achieve at least 90%
          BMI data submission for the current month.
        </p>
      </div>

      <div className="mt-4">
        <h4 className="text-sm text-gray-700 mb-3">Non-Compliant Schools List:</h4>
        <div className="space-y-2">
          {nonCompliantSchools.map((school) => (
            <div
              key={school.id}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div>
                <p className="text-gray-800">{school.schoolName}</p>
                <p className="text-sm text-gray-600">{school.location}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs">
                  NON-COMPLIANT
                </span>
                <p className="text-sm text-red-700 mt-1">{school.completionPercentage}% Complete</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
