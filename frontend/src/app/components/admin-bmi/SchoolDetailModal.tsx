import { X, AlertTriangle, CheckCircle, Clock, TrendingDown, Calendar, Download, FileText } from 'lucide-react';
import { SchoolBMIStatus, StudentBMIStatus } from '../../types/bmiAdmin';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface SchoolDetailModalProps {
  school: SchoolBMIStatus;
  students: StudentBMIStatus[];
  onClose: () => void;
}

export default function SchoolDetailModal({ school, students, onClose }: SchoolDetailModalProps) {
  const updatedStudents = students.filter((s) => s.status === 'Updated');
  const pendingStudents = students.filter((s) => s.status === 'Pending');
  const overdueStudents = students.filter((s) => s.status === 'Overdue');
  const lowBMIStudents = students.filter((s) => s.isUnderweight);
  const bmiDropStudents = students.filter((s) => s.hasBMIDrop);

  // Mock monthly compliance trend data
  const complianceTrendData = [
    { month: 'Jan', completion: 85, submitted: 102, pending: 18 },
    { month: 'Feb', completion: 90, submitted: 108, pending: 12 },
    { month: 'Mar', completion: 75, submitted: 90, pending: 30 },
    { month: 'Apr', completion: 95, submitted: 114, pending: 6 },
    { month: 'May', completion: school.completionPercentage, submitted: school.studentsWithBMI, pending: school.pendingBMI },
  ];

  // Mock update timeline
  const updateTimeline = [
    { date: '2026-05-05', action: 'BMI data uploaded', count: 15, type: 'success' },
    { date: '2026-05-04', action: 'BMI data uploaded', count: 25, type: 'success' },
    { date: '2026-05-03', action: 'BMI data uploaded', count: 30, type: 'success' },
    { date: '2026-05-01', action: 'Reminder sent', count: 0, type: 'info' },
    { date: '2026-04-28', action: 'BMI data uploaded', count: 48, type: 'success' },
  ];

  const handleDownloadReport = () => {
    toast.success('Generating PDF report for ' + school.schoolName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl mb-2">{school.schoolName}</h2>
              <p className="text-blue-100">{school.location} • School ID: {school.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-2 transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm">Download Report</span>
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-blue-100">Total Students</p>
              <p className="text-2xl">{school.totalStudents}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-blue-100">With BMI</p>
              <p className="text-2xl">{school.studentsWithBMI}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-blue-100">Pending</p>
              <p className="text-2xl">{school.pendingBMI}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-sm text-blue-100">Completion</p>
              <p className="text-2xl">{school.completionPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {(lowBMIStudents.length > 0 || bmiDropStudents.length > 0) && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-red-800">Health Alerts</h3>
              </div>
              <div className="space-y-2">
                {lowBMIStudents.length > 0 && (
                  <p className="text-sm text-red-700">
                    • {lowBMIStudents.length} student(s) with underweight BMI requiring attention
                  </p>
                )}
                {bmiDropStudents.length > 0 && (
                  <p className="text-sm text-red-700">
                    • {bmiDropStudents.length} student(s) with sudden BMI drop detected
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="text-sm text-green-800">Updated</h4>
              </div>
              <p className="text-2xl text-green-700">{updatedStudents.length}</p>
              <p className="text-xs text-green-600 mt-1">BMI data current</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h4 className="text-sm text-yellow-800">Pending</h4>
              </div>
              <p className="text-2xl text-yellow-700">{pendingStudents.length}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting submission</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="text-sm text-red-800">Overdue</h4>
              </div>
              <p className="text-2xl text-red-700">{overdueStudents.length}</p>
              <p className="text-xs text-red-600 mt-1">Past deadline</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm text-purple-800">Compliance</h4>
              </div>
              <p className="text-2xl text-purple-700">{school.completionPercentage}%</p>
              <p className="text-xs text-purple-600 mt-1">Current month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg text-gray-800 mb-4">Monthly Compliance Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Completion %"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg text-gray-800 mb-4">Submitted vs Pending (Last 5 Months)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={complianceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" fill="#10b981" name="Submitted" />
                  <Bar dataKey="pending" fill="#ef4444" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(pendingStudents.length > 0 || overdueStudents.length > 0) && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <h3 className="text-lg text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Missing Entries ({pendingStudents.length + overdueStudents.length} students)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...pendingStudents, ...overdueStudents].map((student) => (
                  <div
                    key={student.id}
                    className="bg-white border border-yellow-200 rounded p-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-800">{student.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        student.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg text-gray-800">Update Timeline</h3>
            </div>
            <div className="space-y-3">
              {updateTimeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      event.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-800">{event.action}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(event.date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {event.count > 0 && (
                      <p className="text-xs text-gray-600 mt-1">{event.count} students processed</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg text-gray-800 mb-3">Student-wise BMI Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">BMI</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Last Update</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className={`${
                        student.status === 'Overdue'
                          ? 'bg-red-50'
                          : student.isUnderweight || student.hasBMIDrop
                          ? 'bg-yellow-50'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-800">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {student.lastBMI ? student.lastBMI.toFixed(1) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.bmiCategory ? (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              student.bmiCategory === 'Underweight'
                                ? 'bg-yellow-100 text-yellow-800'
                                : student.bmiCategory === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {student.bmiCategory}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.lastUpdateDate
                          ? format(new Date(student.lastUpdateDate), 'dd/MM/yyyy')
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            student.status === 'Updated'
                              ? 'bg-green-100 text-green-800'
                              : student.status === 'Overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-1">
                          {student.isUnderweight && (
                            <span
                              className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                              title="Low BMI"
                            >
                              ⚠️
                            </span>
                          )}
                          {student.hasBMIDrop && (
                            <span
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                              title="BMI Drop"
                            >
                              <TrendingDown className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {school.lastUpdateDate ? format(new Date(school.lastUpdateDate), 'dd MMMM yyyy, hh:mm a') : 'Never'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
