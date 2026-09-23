import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { SchoolBMIStatus } from '../../types/bmiAdmin';
import ComplianceStatusBadge from './ComplianceStatusBadge';
import { format } from 'date-fns';

interface SchoolComplianceTableProps {
  schools: SchoolBMIStatus[];
  onViewDetails: (schoolId: number) => void;
}

export default function SchoolComplianceTable({ schools, onViewDetails }: SchoolComplianceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      school.complianceStatus.toLowerCase().replace(' ', '-') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getRowColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'hover:bg-green-50';
      case 'Partially Compliant':
        return 'hover:bg-yellow-50';
      case 'Non-Compliant':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl text-gray-800 mb-4">School BMI Compliance</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by school name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="partially-compliant">Partially Compliant</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm text-gray-700">School Name</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Total Students</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">BMI Updated</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Pending BMI</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Last Update</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Completion %</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSchools.map((school) => (
              <tr key={school.id} className={`transition-colors ${getRowColor(school.complianceStatus)}`}>
                <td className="px-4 py-3 text-sm text-gray-800">{school.schoolName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{school.location}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{school.totalStudents}</td>
                <td className="px-4 py-3 text-sm text-green-700">{school.studentsWithBMI}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`${school.pendingBMI > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                    {school.pendingBMI}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {school.lastUpdateDate ? format(new Date(school.lastUpdateDate), 'dd/MM/yyyy') : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          school.completionPercentage >= 90
                            ? 'bg-green-500'
                            : school.completionPercentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${school.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{school.completionPercentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ComplianceStatusBadge status={school.complianceStatus} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetails(school.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSchools.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No schools found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}
