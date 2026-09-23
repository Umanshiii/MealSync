import { useEffect, useState } from 'react';
import { School, TrendingUp, AlertCircle, Eye, LogOut, BarChart3, Activity, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewReports: () => void;
  onViewBMIMonitoring: () => void;
  bmiRecords?: Array<{
    studentId: number;
    month: string;
    year: number;
    recordedAt: string;
    bmi_value: number;
    bmi_category: string;
  }>;
  schools: SchoolData[]; // passed from backend, not hardcoded
}

interface SchoolData {
  id: number;
  name: string;
  location: string;
  nutritionScore: number;
  status: 'Safe' | 'Unsafe';
  attendance: number;
  lastUpdate: string;
}

export default function AdminDashboard({
  onLogout,
  onViewReports,
  onViewBMIMonitoring,
  bmiRecords = [],
  schools = [],
}: AdminDashboardProps) {
  const avgNutrition =
    schools.length > 0
      ? Math.round(schools.reduce((acc, s) => acc + s.nutritionScore, 0) / schools.length)
      : 0;

  const avgAttendance =
    schools.length > 0
      ? Math.round(schools.reduce((acc, s) => acc + s.attendance, 0) / schools.length)
      : 0;

  const unsafeSchools = schools.filter((s) => s.status === 'Unsafe').length;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthRecords = bmiRecords.filter(
    (r) => parseInt(r.month) === currentMonth && r.year === currentYear
  );
  const totalStudentsExpected = 10;
  const studentsWithBMI = new Set(currentMonthRecords.map((r) => r.studentId)).size;
  const bmiCompletionRate =
    totalStudentsExpected > 0
      ? Math.round((studentsWithBMI / totalStudentsExpected) * 100)
      : 0;
  const hasBMIAlert = bmiCompletionRate < 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Government Education Department</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onViewBMIMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                hasBMIAlert
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              BMI Monitoring
              {hasBMIAlert && (
                <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  !
                </span>
              )}
            </button>
            <button
              onClick={onViewReports}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              View Reports
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasBMIAlert && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-red-800 mb-1">⚠️ Incomplete BMI Data</h3>
                <p className="text-sm text-red-700 mb-2">
                  Only {bmiCompletionRate}% of students have BMI data for this month.
                  Schools must complete BMI tracking to ensure health monitoring compliance.
                </p>
                <button
                  onClick={onViewBMIMonitoring}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  Go to BMI Monitoring Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl text-gray-800">{schools.length}</span>
            </div>
            <h3 className="text-gray-600">Total Schools</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl text-gray-800">{avgNutrition}%</span>
            </div>
            <h3 className="text-gray-600">Avg Nutrition Score</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl text-gray-800">{unsafeSchools}</span>
            </div>
            <h3 className="text-gray-600">Low Nutrition Schools</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl text-gray-800">School Overview</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">School Name</th>
                  <th className="px-6 py-4 text-left text-gray-700">Location</th>
                  <th className="px-6 py-4 text-left text-gray-700">Nutrition Score</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Attendance</th>
                  <th className="px-6 py-4 text-left text-gray-700">Last Update</th>
                  <th className="px-6 py-4 text-left text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800">{school.name}</td>
                    <td className="px-6 py-4 text-gray-600">{school.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              school.nutritionScore >= 75
                                ? 'bg-green-500'
                                : school.nutritionScore >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${school.nutritionScore}%` }}
                          />
                        </div>
                        <span className="text-gray-700">{school.nutritionScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          school.status === 'Safe'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{school.attendance}%</td>
                    <td className="px-6 py-4 text-gray-600">{school.lastUpdate}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}