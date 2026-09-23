import { useState } from 'react';
import { ArrowLeft, School, CheckCircle, AlertTriangle, Users, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import KPICard from './admin-bmi/KPICard';
import SchoolComplianceTable from './admin-bmi/SchoolComplianceTable';
import PrioritySchoolsList from './admin-bmi/PrioritySchoolsList';
import SchoolDetailModal from './admin-bmi/SchoolDetailModal';
import AlertBanner from './admin-bmi/AlertBanner';
import NotificationActionBar from './admin-bmi/NotificationActionBar';
import MonthlyComplianceTracker from './admin-bmi/MonthlyComplianceTracker';
import EnforcementPanel from './admin-bmi/EnforcementPanel';
import ComplianceTrendChart from './admin-bmi/ComplianceTrendChart';
import { mockSchoolBMIData, getMockStudentBMIData, getDashboardSummary } from '../utils/mockBMIData';
import { SchoolBMIStatus } from '../types/bmiAdmin';
import { format } from 'date-fns';

interface BMIMonitoringDashboardProps {
  onBack: () => void;
}

export default function BMIMonitoringDashboard({ onBack }: BMIMonitoringDashboardProps) {
  const [schools] = useState<SchoolBMIStatus[]>(mockSchoolBMIData);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const summary = getDashboardSummary(schools);
  const nonCompliantSchools = schools.filter(s => s.complianceStatus === 'Non-Compliant');

  const selectedSchool = selectedSchoolId
    ? schools.find((s) => s.id === selectedSchoolId)
    : null;

  const selectedSchoolStudents = selectedSchoolId
    ? getMockStudentBMIData(selectedSchoolId)
    : [];

  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDay;

  const showReminderAlert = daysRemaining <= 3 && daysRemaining >= 0;
  const showWarningAlert = summary.nonCompliantSchools > 0;

  const complianceChartData = [
    { name: 'Fully Compliant', value: summary.fullyCompliantSchools, color: '#10b981' },
    { name: 'Partially Compliant', value: summary.partiallyCompliantSchools, color: '#f59e0b' },
    { name: 'Non-Compliant', value: summary.nonCompliantSchools, color: '#ef4444' },
  ];

  const schoolComparisonData = schools
    .slice(0, 6)
    .map((s) => ({
      name: s.schoolName.split(' ')[0],
      completion: s.completionPercentage,
      pending: ((s.pendingBMI / s.totalStudents) * 100).toFixed(0),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl text-gray-800">BMI Monitoring Dashboard</h1>
              <p className="text-gray-600">Government Education Department • School Health Compliance</p>
            </div>

            <div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                max={format(new Date(), 'yyyy-MM')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showWarningAlert && (
          <AlertBanner
            type="warning"
            message="⚠️ WARNING: BMI data not submitted for previous month by some schools."
            schoolCount={summary.nonCompliantSchools}
          />
        )}

        {showReminderAlert && summary.partiallyCompliantSchools > 0 && (
          <AlertBanner
            type="reminder"
            message="🔔 REMINDER: Please ensure all schools upload BMI data for all students before month end (2-3 days remaining)."
            schoolCount={summary.partiallyCompliantSchools}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Schools"
            value={summary.totalSchools}
            icon={School}
            color="blue"
          />
          <KPICard
            title="Fully Compliant Schools"
            value={summary.fullyCompliantSchools}
            icon={CheckCircle}
            color="green"
            subtitle="100% BMI data submitted"
          />
          <KPICard
            title="Partially Updated Schools"
            value={summary.partiallyCompliantSchools}
            icon={Activity}
            color="yellow"
            subtitle="Require attention"
          />
          <KPICard
            title="Non-Compliant Schools"
            value={summary.nonCompliantSchools}
            icon={AlertTriangle}
            color="red"
            subtitle="Immediate action required"
          />
          <KPICard
            title="Total Pending Students"
            value={summary.totalPendingStudents}
            icon={Users}
            color="purple"
          />
          <KPICard
            title="Schools Requiring Action"
            value={summary.schoolsRequiringAction}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="mb-8">
          <MonthlyComplianceTracker schools={schools} />
        </div>

        <div className="mb-8">
          <NotificationActionBar
            totalSchools={summary.totalSchools}
            nonCompliantCount={summary.nonCompliantSchools}
            partiallyCompliantCount={summary.partiallyCompliantSchools}
          />
        </div>

        <div className="mb-8">
          <EnforcementPanel nonCompliantSchools={nonCompliantSchools} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">📊 Analytics & Reports</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg text-gray-800 mb-4">Compliance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {complianceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="text-green-700 text-xl">{Math.round((summary.fullyCompliantSchools / summary.totalSchools) * 100)}%</p>
                  <p className="text-gray-600">Compliant</p>
                </div>
                <div>
                  <p className="text-yellow-700 text-xl">{Math.round((summary.partiallyCompliantSchools / summary.totalSchools) * 100)}%</p>
                  <p className="text-gray-600">Pending</p>
                </div>
                <div>
                  <p className="text-red-700 text-xl">{Math.round((summary.nonCompliantSchools / summary.totalSchools) * 100)}%</p>
                  <p className="text-gray-600">Non-Compliant</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg text-gray-800 mb-4">School Completion Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={schoolComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" fill="#10b981" name="Completed %" />
                  <Bar dataKey="pending" fill="#ef4444" name="Pending %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ComplianceTrendChart />
        </div>

        <div className="mb-8">
          <PrioritySchoolsList
            schools={schools}
            onViewDetails={(id) => setSelectedSchoolId(id)}
          />
        </div>

        <div>
          <SchoolComplianceTable
            schools={schools}
            onViewDetails={(id) => setSelectedSchoolId(id)}
          />
        </div>
      </div>

      {selectedSchool && (
        <SchoolDetailModal
          school={selectedSchool}
          students={selectedSchoolStudents}
          onClose={() => setSelectedSchoolId(null)}
        />
      )}
    </div>
  );
}
