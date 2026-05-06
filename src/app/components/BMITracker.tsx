import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Scale, Ruler, Calendar as CalendarIcon, Save, History, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BMIReminderBanner from './BMIReminderBanner';
import { getOverallBMIStatus, getBMIStatusForMonth, getStatusColor, getStatusIcon, type StudentBMIStatus } from '../utils/bmiStatusUtils';

interface BMITrackerProps {
  onBack: () => void;
  initialRecords?: BMIRecord[];
  onRecordsUpdate?: (records: BMIRecord[]) => void;
}

interface Student {
  id: number;
  name: string;
}

export interface BMIRecord {
  studentId: number;
  height_cm: number;
  weight_kg: number;
  bmi_value: number;
  bmi_category: string;
  month: string;
  year: number;
  recorded_by: string;
  recordedAt: string;
}

const SCHOOL_INFO = {
  name: 'Sunrise Public School',
  code: 'SPS-2024-MH-001',
};

const STUDENTS: Student[] = [
  { id: 1, name: 'Rahul Kumar' },
  { id: 2, name: 'Priya Sharma' },
  { id: 3, name: 'Amit Patel' },
  { id: 4, name: 'Sneha Singh' },
  { id: 5, name: 'Raj Verma' },
  { id: 6, name: 'Anjali Reddy' },
  { id: 7, name: 'Vikram Joshi' },
  { id: 8, name: 'Divya Nair' },
  { id: 9, name: 'Arjun Desai' },
  { id: 10, name: 'Kavya Menon' },
];

const calculateBMI = (height_cm: number, weight_kg: number) => {
  const height_m = height_cm / 100;
  const bmi = weight_kg / (height_m * height_m);
  return parseFloat(bmi.toFixed(2));
};

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const getBMICategoryColor = (category: string): string => {
  switch (category) {
    case 'Underweight':
      return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    case 'Normal':
      return 'text-green-700 bg-green-50 border-green-300';
    case 'Overweight':
      return 'text-orange-700 bg-orange-50 border-orange-300';
    case 'Obese':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-300';
  }
};

export default function BMITracker({ onBack, initialRecords = [], onRecordsUpdate }: BMITrackerProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>(initialRecords);
  const [showHistory, setShowHistory] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [bmiStatus, setBmiStatus] = useState<ReturnType<typeof getOverallBMIStatus> | null>(null);
  const [studentStatuses, setStudentStatuses] = useState<StudentBMIStatus[]>([]);

  useEffect(() => {
    const studentsForStatus = STUDENTS.map(s => ({ id: s.id, name: s.name }));
    const status = getOverallBMIStatus(studentsForStatus, bmiRecords);
    setBmiStatus(status);
    setStudentStatuses(status.studentStatuses);
  }, [bmiRecords]);

  useEffect(() => {
    if (onRecordsUpdate) {
      onRecordsUpdate(bmiRecords);
    }
  }, [bmiRecords]);

  const handleCalculate = () => {
    if (!height || !weight) {
      toast.error('Please enter both height and weight');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum <= 0 || weightNum <= 0) {
      toast.error('Please enter valid values');
      return;
    }

    const bmi = calculateBMI(heightNum, weightNum);
    setCalculatedBMI(bmi);
  };

  const handleSave = () => {
    if (!selectedStudent || !height || !weight || calculatedBMI === null) {
      toast.error('Please complete all fields and calculate BMI first');
      return;
    }

    const [year, month] = selectedMonth.split('-');
    const category = getBMICategory(calculatedBMI);

    const existingRecordIndex = bmiRecords.findIndex(
      (record) =>
        record.studentId === selectedStudent &&
        record.month === month &&
        record.year === parseInt(year)
    );

    const newRecord: BMIRecord = {
      studentId: selectedStudent,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      bmi_value: calculatedBMI,
      bmi_category: category,
      month: month,
      year: parseInt(year),
      recorded_by: 'Teacher',
      recordedAt: new Date().toISOString(),
    };

    if (existingRecordIndex !== -1) {
      const updatedRecords = [...bmiRecords];
      updatedRecords[existingRecordIndex] = newRecord;
      setBmiRecords(updatedRecords);
      toast.success('BMI record updated successfully!');
    } else {
      setBmiRecords([...bmiRecords, newRecord]);
      toast.success('BMI record saved successfully!');
    }

    setHeight('');
    setWeight('');
    setCalculatedBMI(null);
    setSelectedStudent(null);
  };

  const getStudentRecords = (studentId: number) => {
    return bmiRecords
      .filter((record) => record.studentId === studentId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return parseInt(b.month) - parseInt(a.month);
      });
  };

  const getCurrentMonthRecord = (studentId: number) => {
    const [year, month] = selectedMonth.split('-');
    return bmiRecords.find(
      (record) =>
        record.studentId === studentId &&
        record.month === month &&
        record.year === parseInt(year)
    );
  };

  const getMonthName = (month: string) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[parseInt(month) - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl text-gray-800">BMI Tracker</h1>
              <p className="text-gray-600">{SCHOOL_INFO.name} • {SCHOOL_INFO.code}</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              <History className="w-5 h-5" />
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {bmiStatus && (
          <BMIReminderBanner
            status={bmiStatus.status}
            pendingCount={bmiStatus.pendingCount}
            overdueCount={bmiStatus.overdueCount}
            criticalStudents={bmiStatus.criticalStudents}
            onNavigateToBMI={() => setShowHistory(false)}
          />
        )}

        {!showHistory ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-800">Record Monthly BMI</h2>
                <div className="text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(bmiStatus?.status || 'PENDING')}`}>
                    {getStatusIcon(bmiStatus?.status || 'PENDING')} {bmiStatus?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl text-green-700">{bmiStatus?.completedCount || 0}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl text-yellow-700">{bmiStatus?.pendingCount || 0}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl text-red-700">{bmiStatus?.overdueCount || 0}</p>
                    <p className="text-xs text-gray-600">Overdue</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Select Month</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      max={format(new Date(), 'yyyy-MM')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Select Student</label>
                  <select
                    value={selectedStudent || ''}
                    onChange={(e) => {
                      const studentId = parseInt(e.target.value);
                      setSelectedStudent(studentId);

                      const existingRecord = getCurrentMonthRecord(studentId);
                      if (existingRecord) {
                        setHeight(existingRecord.height_cm.toString());
                        setWeight(existingRecord.weight_kg.toString());
                        setCalculatedBMI(existingRecord.bmi_value);
                        toast.info('Loaded existing record for this month');
                      } else {
                        setHeight('');
                        setWeight('');
                        setCalculatedBMI(null);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose a student...</option>
                    {STUDENTS.map((student) => {
                      const studentStatus = studentStatuses.find(s => s.studentId === student.id);
                      const statusIcon = getStatusIcon(studentStatus?.status || 'PENDING');
                      return (
                        <option key={student.id} value={student.id}>
                          {statusIcon} {student.name} {studentStatus?.isUnderweight ? '⚠️ Low BMI' : ''} {studentStatus?.hasBMIDrop ? '📉 BMI Drop' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {selectedStudent && studentStatuses.find(s => s.studentId === selectedStudent)?.status === 'OVERDUE' && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-sm text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      This student has overdue BMI data from last month!
                    </div>
                  )}

                  {selectedStudent && (studentStatuses.find(s => s.studentId === selectedStudent)?.isUnderweight ||
                                       studentStatuses.find(s => s.studentId === selectedStudent)?.hasBMIDrop) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
                      ⚠️ This student requires immediate health attention
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        setCalculatedBMI(null);
                      }}
                      placeholder="Enter height in cm"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        setCalculatedBMI(null);
                      }}
                      placeholder="Enter weight in kg"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Calculate BMI
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl text-gray-800 mb-6">BMI Results</h2>

              {calculatedBMI !== null ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <p className="text-gray-600 mb-2">BMI Value</p>
                      <p className="text-5xl text-purple-700">{calculatedBMI}</p>
                    </div>

                    <div className="flex justify-center">
                      <span
                        className={`px-4 py-2 rounded-full border-2 ${getBMICategoryColor(
                          getBMICategory(calculatedBMI)
                        )}`}
                      >
                        {getBMICategory(calculatedBMI)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm text-gray-700 mb-3">BMI Categories Reference</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Underweight:</span>
                        <span className="text-gray-800">&lt; 18.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Normal:</span>
                        <span className="text-gray-800">18.5 - 24.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overweight:</span>
                        <span className="text-gray-800">25 - 29.9</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Obese:</span>
                        <span className="text-gray-800">≥ 30</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Calculation:</strong> BMI = {weight}kg ÷ ({height}cm ÷ 100)² = {calculatedBMI}
                    </p>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save BMI Record
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Activity className="w-16 h-16 mb-4" />
                  <p>Enter student data and calculate BMI to see results</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl text-gray-800 mb-6">BMI History</h2>

            <div className="space-y-6">
              {STUDENTS.map((student) => {
                const records = getStudentRecords(student.id);
                if (records.length === 0) return null;

                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      {student.name}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">Month/Year</th>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">Height (cm)</th>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">Weight (kg)</th>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">BMI</th>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left text-sm text-gray-700">Recorded</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {records.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-800">
                                {getMonthName(record.month)} {record.year}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.height_cm}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.weight_kg}</td>
                              <td className="px-4 py-3 text-sm text-gray-800">
                                {record.bmi_value}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs border ${getBMICategoryColor(
                                    record.bmi_category
                                  )}`}
                                >
                                  {record.bmi_category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {format(new Date(record.recordedAt), 'dd/MM/yyyy')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {bmiRecords.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4" />
                  <p>No BMI records found. Start recording student measurements.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
