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
  name: 'N.P.S. CHANDWADI SHIV NAGAR BHOPAL',
  code: '197062',
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

// Updated utility classes to use clean government tracking palettes instead of vibrant secondary colors
const getBMICategoryColor = (category: string): string => {
  switch (category) {
    case 'Underweight':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Normal':
      return 'text-[#138808] bg-[#EAF5EE] border-[#138808]/10';
    case 'Overweight':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Obese':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
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
      toast.error('Please enter both height and weight parameters');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum <= 0 || weightNum <= 0) {
      toast.error('Please input numbers greater than 0');
      return;
    }

    const bmi = calculateBMI(heightNum, weightNum);
    setCalculatedBMI(bmi);
  };

  const handleSave = () => {
    if (!selectedStudent || !height || !weight || calculatedBMI === null) {
      toast.error('Complete calculations before archiving sheet coordinates');
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
      recorded_by: 'Supervisor',
      recordedAt: new Date().toISOString(),
    };

    if (existingRecordIndex !== -1) {
      const updatedRecords = [...bmiRecords];
      updatedRecords[existingRecordIndex] = newRecord;
      setBmiRecords(updatedRecords);
      toast.success('Archived student context row updated successfully');
    } else {
      setBmiRecords([...bmiRecords, newRecord]);
      toast.success('Student context row recorded into tracking matrix');
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
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(month) - 1];
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans selection:bg-[#2C533A]/10 text-[#334155]">
      
      {/* 1. TOP NAV BAR (Matches SupervisorDashboard Header exactly) */}
      <nav className="w-full bg-[#2C533A] text-white px-6 py-4 flex justify-between items-center border-b-4 border-[#FF9933] shadow-md">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl transition-all shadow-sm group flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-base font-extrabold uppercase tracking-wider leading-none">BMI Evaluation Terminal</h1>
            <p className="text-[8px] font-bold text-white/70 tracking-widest uppercase mt-1">{SCHOOL_INFO.name} • DISE_{SCHOOL_INFO.code}</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
        >
          <History className="w-3.5 h-3.5" />
          {showHistory ? 'Close History' : 'View Logs'}
        </button>
      </nav>

      {/* MAIN LAYOUT BODY */}
      <div className="max-w-[1500px] w-full mx-auto p-4 lg:p-6 space-y-6 flex-1">
        
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* RECORDING CONSOLE (Left Card - Spans 7 Columns) */}
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F7FAFC]">
                <h2 className="text-base font-extrabold uppercase text-[#2C533A] tracking-wider">Record Monthly Metrics</h2>
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Monthly Status: </span>
                  <span className={`px-2.5 py-1 rounded-md border ${getStatusColor(bmiStatus?.status || 'PENDING')}`}>
                    {bmiStatus?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Matrix Counter Cells */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-black text-[#138808]">{bmiStatus?.completedCount || 0}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Completed</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#FF9933]">{bmiStatus?.pendingCount || 0}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-red-500">{bmiStatus?.overdueCount || 0}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Overdue</p>
                  </div>
                </div>
              </div>

              {/* Form Input Controllers */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1 block">Target Evaluation Period</label>
                  <div className="relative flex items-center">
                    <CalendarIcon className="absolute left-4 w-4 h-4 text-gray-400" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      max={format(new Date(), 'yyyy-MM')}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:border-[#2C533A] text-[#334155] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1 block">Target Student Candidate</label>
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
                        toast.info('Loaded saved archival parameters for current target month');
                      } else {
                        setHeight('');
                        setWeight('');
                        setCalculatedBMI(null);
                      }
                    }}
                    className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:border-[#2C533A] text-[#334155] cursor-pointer"
                  >
                    <option value="">Choose a student from context registry...</option>
                    {STUDENTS.map((student) => {
                      const studentStatus = studentStatuses.find(s => s.studentId === student.id);
                      return (
                        <option key={student.id} value={student.id}>
                          {student.name} {studentStatus?.isUnderweight ? '⚠️ Low Range' : ''} {studentStatus?.hasBMIDrop ? '📉 Drop Trend' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {selectedStudent && studentStatuses.find(s => s.studentId === selectedStudent)?.status === 'OVERDUE' && (
                    <div className="mt-2 p-2 px-3 bg-red-50 border border-red-200 rounded-xl text-[10px] font-bold text-red-800 flex items-center gap-2 animate-in fade-in duration-150">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Candidate record logs are overdue from previous reporting matrix.
                    </div>
                  )}

                  {selectedStudent && (studentStatuses.find(s => s.studentId === selectedStudent)?.isUnderweight ||
                                       studentStatuses.find(s => s.studentId === selectedStudent)?.hasBMIDrop) && (
                    <div className="mt-2 p-2 px-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] font-bold text-amber-800 animate-in fade-in duration-150">
                      ⚠️ Medical Protocol Notice: Target profile indicators require localized clinical verification.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1 block">Height (cm)</label>
                    <div className="relative flex items-center">
                      <Ruler className="absolute left-4 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => {
                          setHeight(e.target.value);
                          setCalculatedBMI(null);
                        }}
                        placeholder="Metrics in cm"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:border-[#2C533A] text-[#334155] transition-colors"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1 block">Weight (kg)</label>
                    <div className="relative flex items-center">
                      <Scale className="absolute left-4 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => {
                          setWeight(e.target.value);
                          setCalculatedBMI(null);
                        }}
                        placeholder="Metrics in kg"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold outline-none focus:border-[#2C533A] text-[#334155] transition-colors"
                        step="0.1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full px-6 py-3.5 bg-[#2C533A] text-white rounded-xl hover:bg-[#1E3B29] transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest mt-4 shadow-sm"
                >
                  <Activity className="w-4 h-4" /> Calculate BMI Metrics
                </button>
              </div>
            </div>

            {/* RESULTS VIEWPORT (Right Card - Spans 5 Columns) */}
            <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8 min-h-[420px] flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 pb-3 border-b border-[#F7FAFC] mb-6">Evaluation Output</h2>

              <div className="flex-1 flex flex-col justify-center">
                {calculatedBMI !== null ? (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-inner">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Body Mass Index</p>
                      <p className="text-5xl font-black text-[#334155] tracking-tighter mb-4">{calculatedBMI}</p>

                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm ${getBMICategoryColor(getBMICategory(calculatedBMI))}`}>
                          {getBMICategory(calculatedBMI)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-[11px] space-y-2">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Scale Threshold Ref</h3>
                      <div className="flex justify-between font-medium"><span className="text-gray-400">Underweight:</span><span className="font-bold text-gray-700">&lt; 18.5</span></div>
                      <div className="flex justify-between font-medium"><span className="text-gray-400">Normal Range:</span><span className="font-bold text-gray-700">18.5 – 24.9</span></div>
                      <div className="flex justify-between font-medium"><span className="text-gray-400">Overweight:</span><span className="font-bold text-gray-700">25.0 – 29.9</span></div>
                      <div className="flex justify-between font-medium"><span className="text-gray-400">Obese Status:</span><span className="font-bold text-gray-700">≥ 30.0</span></div>
                    </div>

                    <button
                      onClick={handleSave}
                      className="w-full px-6 py-4 bg-[#138808] hover:bg-green-800 text-white rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-md"
                    >
                      <Save className="w-4 h-4" /> Save Diagnostic Entry
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-gray-300 max-w-xs mx-auto space-y-3">
                    <Activity className="w-12 h-12 stroke-[1.5]" />
                    <div>
                      <p className="text-xs font-bold text-[#334155]">Awaiting Coordinates</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-1 leading-relaxed">Select a candidate student profile node and calculate tracking parameters to display assessment scores.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          
          /* HISTORICAL SYSTEM LOG SHEETS */
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-base font-extrabold uppercase text-[#2C533A] tracking-wider pb-3 border-b border-[#F7FAFC] mb-6">Historical Data Archive</h2>

            <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {STUDENTS.map((student) => {
                const records = getStudentRecords(student.id);
                if (records.length === 0) return null;

                return (
                  <div key={student.id} className="border border-[#E2E8F0] rounded-2xl p-5 bg-[#F8FAFC]/50 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#334155] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                      <TrendingUp className="w-4 h-4 text-[#2C533A]" />
                      {student.name}
                    </h3>

                    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-[#E2E8F0] text-[9px] font-black text-[#A0AEC0] uppercase tracking-widest">
                            <th className="px-5 py-3">Reporting Period</th>
                            <th className="px-5 py-3">Height</th>
                            <th className="px-5 py-3">Weight</th>
                            <th className="px-5 py-3">Index Score</th>
                            <th className="px-5 py-3">Classification</th>
                            <th className="px-5 py-3">Sync Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9] text-xs font-bold text-[#334155]">
                          {records.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                              <td className="px-5 py-3.5 text-gray-500 font-extrabold uppercase text-[10px]">{getMonthName(record.month)} {record.year}</td>
                              <td className="px-5 py-3.5">{record.height_cm} cm</td>
                              <td className="px-5 py-3.5">{record.weight_kg} kg</td>
                              <td className="px-5 py-3.5 text-sm font-black">{record.bmi_value}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase ${getBMICategoryColor(record.bmi_category)}`}>
                                  {record.bmi_category}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-gray-400 font-mono tracking-tighter text-[10px]">{format(new Date(record.recordedAt), 'dd/MM/yyyy')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {bmiRecords.length === 0 && (
                <div className="text-center py-20 text-gray-300 flex flex-col items-center justify-center space-y-3">
                  <History className="w-14 h-14 stroke-[1.5]" />
                  <p className="text-xs font-bold text-[#334155]">No Diagnostic Entries Found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CORE ALIGNED CUSTOM SHEET VIEWPORT */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}

// --- SUB LAYOUT CONTAINER CONTROLLERS ---
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs transition-all ${active ? 'bg-[#F5F5DC] text-[#3A2F27] shadow-xl' : 'text-[#F5F5DC]/60 hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}