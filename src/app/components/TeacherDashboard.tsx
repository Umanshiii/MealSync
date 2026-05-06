import { useState, useEffect } from 'react';
import { Upload, Users, Camera, CheckCircle2, XCircle, LogOut, Calendar as CalendarIcon, School, MapPin, Hash, Award, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import BMIReminderBanner from './BMIReminderBanner';
import { getOverallBMIStatus } from '../utils/bmiStatusUtils';

interface TeacherDashboardProps {
  onLogout: () => void;
  onOpenBMI: () => void;
  bmiRecords?: Array<{
    studentId: number;
    month: string;
    year: number;
    recordedAt: string;
    bmi_value: number;
    bmi_category: string;
  }>;
}

interface Student {
  id: number;
  name: string;
  present: boolean;
}

interface AttendanceRecord {
  date: string;
  students: Student[];
  submitted: boolean;
  mealPhotoUrl?: string;
  nutritionScore?: number;
}

const SCHOOL_INFO = {
  name: 'Sunrise Public School',
  code: 'SPS-2024-MH-001',
  location: 'Andheri West, Mumbai, Maharashtra',
};

const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: 'Rahul Kumar', present: false },
  { id: 2, name: 'Priya Sharma', present: false },
  { id: 3, name: 'Amit Patel', present: false },
  { id: 4, name: 'Sneha Singh', present: false },
  { id: 5, name: 'Raj Verma', present: false },
  { id: 6, name: 'Anjali Reddy', present: false },
  { id: 7, name: 'Vikram Joshi', present: false },
  { id: 8, name: 'Divya Nair', present: false },
  { id: 9, name: 'Arjun Desai', present: false },
  { id: 10, name: 'Kavya Menon', present: false },
];

export default function TeacherDashboard({ onLogout, onOpenBMI, bmiRecords = [] }: TeacherDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(true);
  const [bmiStatus, setBmiStatus] = useState<ReturnType<typeof getOverallBMIStatus> | null>(null);

  useEffect(() => {
    const studentsForStatus = INITIAL_STUDENTS.map(s => ({ id: s.id, name: s.name }));
    const status = getOverallBMIStatus(studentsForStatus, bmiRecords);
    setBmiStatus(status);
  }, [bmiRecords]);

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const currentRecord = dateKey ? attendanceRecords[dateKey] : undefined;
  const isSubmitted = currentRecord?.submitted || false;
  const hasAttendanceForDate = !!currentRecord;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const key = format(date, 'yyyy-MM-dd');

    if (attendanceRecords[key]) {
      setStudents(attendanceRecords[key].students);
      if (attendanceRecords[key].mealPhotoUrl) {
        setImagePreview(attendanceRecords[key].mealPhotoUrl!);
      } else {
        setImagePreview('');
      }
      setSelectedImage(null);
    } else {
      setStudents(INITIAL_STUDENTS.map(s => ({ ...s, present: false })));
      setImagePreview('');
      setSelectedImage(null);
    }

    setShowCalendar(false);
  };

  const toggleAttendance = (id: number) => {
    if (isSubmitted) return;
    setStudents(students.map(student =>
      student.id === id ? { ...student, present: !student.present } : student
    ));
  };

  const handleAttendanceSubmit = () => {
    if (!selectedDate) return;

    const key = format(selectedDate, 'yyyy-MM-dd');
    const presentCount = students.filter(s => s.present).length;

    setAttendanceRecords({
      ...attendanceRecords,
      [key]: {
        date: key,
        students: students.map(s => ({ ...s })),
        submitted: true,
      },
    });

    toast.success(`Attendance submitted! ${presentCount} students marked present.`);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMealPhotoSubmit = async () => {
    if (!selectedImage || !selectedDate) {
      toast.error('Please upload a meal photo');
      return;
    }

    const key = format(selectedDate, 'yyyy-MM-dd');

    toast.loading('Analyzing nutrition...', { id: 'nutrition-analysis' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const nutritionScore = Math.floor(Math.random() * 30) + 65;

    setAttendanceRecords({
      ...attendanceRecords,
      [key]: {
        ...attendanceRecords[key],
        mealPhotoUrl: imagePreview,
        nutritionScore: nutritionScore,
      },
    });

    toast.success(`Meal photo uploaded! Nutrition Score: ${nutritionScore}%`, { id: 'nutrition-analysis' });
    setSelectedImage(null);
  };

  const presentCount = students.filter(s => s.present).length;
  const totalCount = students.length;

  const getDatesWithRecords = () => {
    return Object.keys(attendanceRecords).map(key => new Date(key));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl text-gray-800">Teacher Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onOpenBMI}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                <Activity className="w-5 h-5" />
                BMI Tracker
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

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <School className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">School Name</p>
                  <p className="text-sm text-gray-800">{SCHOOL_INFO.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">School Code</p>
                  <p className="text-sm text-gray-800">{SCHOOL_INFO.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="text-sm text-gray-800">{SCHOOL_INFO.location}</p>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-800">
                    Selected Date: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
                  </span>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Date
                  </button>
                </div>
              </div>
            )}
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
            onNavigateToBMI={onOpenBMI}
          />
        )}

        {showCalendar ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl text-gray-800">Select Date for Attendance</h2>
            </div>

            <div className="flex justify-center mb-6">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="border rounded-lg p-4"
                disabled={(date) => date > new Date()}
                modifiers={{
                  hasRecord: getDatesWithRecords(),
                }}
                modifiersStyles={{
                  hasRecord: {
                    backgroundColor: '#dcfce7',
                    fontWeight: 'bold',
                  },
                }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📅 Select a date to view or mark attendance. Dates with existing records are highlighted in green.
              </p>
            </div>
          </div>
        ) : (
          <>
            {!hasAttendanceForDate && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ℹ️ No attendance record found for this date. Please mark attendance below.
                </p>
              </div>
            )}

            {isSubmitted && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✓ Attendance has been submitted for this date. View-only mode.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl text-gray-800">
                      {isSubmitted ? 'Attendance Record' : 'Mark Attendance'}
                    </h2>
                  </div>
                  <div className="bg-green-100 px-4 py-2 rounded-lg">
                    <span className="text-green-800">{presentCount}/{totalCount} Present</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleAttendance(student.id)}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        isSubmitted ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        student.present
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50 border-2 border-gray-200'
                      } ${!isSubmitted && !student.present ? 'hover:border-gray-300' : ''}`}
                    >
                      <span className={`${student.present ? 'text-green-800' : 'text-gray-700'}`}>
                        {student.name}
                      </span>
                      {student.present ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>

                {!isSubmitted && (
                  <div className="mt-6">
                    <button
                      onClick={handleAttendanceSubmit}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      Submit Attendance
                    </button>
                  </div>
                )}
              </div>

              {isSubmitted && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Camera className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl text-gray-800">Meal Photo & Nutrition</h2>
                  </div>

                  {!currentRecord?.mealPhotoUrl ? (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Meal preview"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <button
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview('');
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Upload today's meal photo</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="meal-upload"
                            />
                            <label
                              htmlFor="meal-upload"
                              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                            >
                              Choose Photo
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          📸 Upload a clear photo of the meal. The system will analyze nutritional content automatically.
                        </p>
                      </div>

                      {selectedImage && (
                        <button
                          onClick={handleMealPhotoSubmit}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Upload & Analyze Nutrition
                        </button>
                      )}
                    </>
                  ) : (
                    <div>
                      <img
                        src={currentRecord.mealPhotoUrl}
                        alt="Meal"
                        className="max-h-64 mx-auto rounded-lg mb-4"
                      />

                      {currentRecord.nutritionScore !== undefined && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Award className="w-6 h-6 text-green-600" />
                              <h3 className="text-lg text-gray-800">Nutrition Score</h3>
                            </div>
                            <span className="text-3xl text-green-700">{currentRecord.nutritionScore}%</span>
                          </div>

                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full ${
                                currentRecord.nutritionScore >= 75
                                  ? 'bg-green-500'
                                  : currentRecord.nutritionScore >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${currentRecord.nutritionScore}%` }}
                            />
                          </div>

                          <p className="text-sm text-gray-700">
                            Status: <span className={`${
                              currentRecord.nutritionScore >= 75
                                ? 'text-green-700'
                                : currentRecord.nutritionScore >= 60
                                ? 'text-yellow-700'
                                : 'text-red-700'
                            }`}>
                              {currentRecord.nutritionScore >= 75 ? 'Excellent' : currentRecord.nutritionScore >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
