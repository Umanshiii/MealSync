import { AlertTriangle, Eye } from 'lucide-react';
import { SchoolBMIStatus } from '../../types/bmiAdmin';

interface PrioritySchoolsListProps {
  schools: SchoolBMIStatus[];
  onViewDetails: (schoolId: number) => void;
}

export default function PrioritySchoolsList({ schools, onViewDetails }: PrioritySchoolsListProps) {
  const prioritySchools = schools
    .filter(
      (s) =>
        s.complianceStatus !== 'Compliant' ||
        s.completionPercentage < 70 ||
        s.overdueStudents > 10 ||
        s.lowBMICount > 5
    )
    .sort((a, b) => {
      if (a.complianceStatus === 'Non-Compliant' && b.complianceStatus !== 'Non-Compliant')
        return -1;
      if (b.complianceStatus === 'Non-Compliant' && a.complianceStatus !== 'Non-Compliant')
        return 1;
      return a.completionPercentage - b.completionPercentage;
    });

  const getUrgencyLevel = (school: SchoolBMIStatus) => {
    if (school.complianceStatus === 'Non-Compliant' || school.completionPercentage === 0) {
      return { level: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' };
    }
    if (school.completionPercentage < 50 || school.overdueStudents > 20) {
      return { level: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' };
    }
    return { level: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' };
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl text-gray-800">Schools Requiring Immediate Action</h2>
      </div>

      {prioritySchools.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-green-600 mb-2">✓ All schools are compliant</p>
          <p className="text-sm text-gray-500">No immediate action required</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prioritySchools.map((school) => {
            const urgency = getUrgencyLevel(school);
            return (
              <div
                key={school.id}
                className={`${urgency.bg} border ${urgency.border} rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-800">{school.schoolName}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${urgency.color} border ${urgency.border}`}>
                        {urgency.level} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{school.location}</p>
                  </div>
                  <button
                    onClick={() => onViewDetails(school.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Completion</p>
                    <p className={`text-lg ${urgency.color}`}>{school.completionPercentage}%</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-lg text-red-700">{school.pendingBMI}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Overdue</p>
                    <p className="text-lg text-red-700">{school.overdueStudents}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Low BMI</p>
                    <p className="text-lg text-yellow-700">{school.lowBMICount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
