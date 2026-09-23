import { format, getDaysInMonth, getDate, isAfter, startOfMonth, endOfMonth, isBefore } from 'date-fns';

export type BMIStatus = 'PENDING' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';

export interface StudentBMIStatus {
  studentId: number;
  studentName: string;
  status: BMIStatus;
  lastUpdateDate: string | null;
  lastBMI: number | null;
  category: string | null;
  isUnderweight: boolean;
  hasBMIDrop: boolean;
}

export const getBMIStatusForMonth = (
  studentId: number,
  studentName: string,
  records: Array<{
    studentId: number;
    month: string;
    year: number;
    recordedAt: string;
    bmi_value: number;
    bmi_category: string;
  }>,
  targetDate: Date = new Date()
): StudentBMIStatus => {
  const targetYear = targetDate.getFullYear();
  const targetMonth = (targetDate.getMonth() + 1).toString().padStart(2, '0');

  const currentMonthRecord = records.find(
    (r) =>
      r.studentId === studentId &&
      r.month === targetMonth &&
      r.year === targetYear
  );

  const studentRecords = records
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const lastRecord = studentRecords[0];
  const secondLastRecord = studentRecords[1];

  const isUnderweight = lastRecord ? lastRecord.bmi_category === 'Underweight' : false;
  const hasBMIDrop =
    lastRecord && secondLastRecord
      ? lastRecord.bmi_value < secondLastRecord.bmi_value - 2
      : false;

  if (currentMonthRecord) {
    return {
      studentId,
      studentName,
      status: 'COMPLETED',
      lastUpdateDate: currentMonthRecord.recordedAt,
      lastBMI: currentMonthRecord.bmi_value,
      category: currentMonthRecord.bmi_category,
      isUnderweight,
      hasBMIDrop,
    };
  }

  const currentDay = getDate(targetDate);
  const daysInMonth = getDaysInMonth(targetDate);
  const daysRemaining = daysInMonth - currentDay;

  const monthStart = startOfMonth(targetDate);
  const isCurrentMonth =
    targetDate.getMonth() === new Date().getMonth() &&
    targetDate.getFullYear() === new Date().getFullYear();

  if (isCurrentMonth) {
    if (daysRemaining <= 2 && daysRemaining >= 0) {
      return {
        studentId,
        studentName,
        status: 'DUE_SOON',
        lastUpdateDate: lastRecord?.recordedAt || null,
        lastBMI: lastRecord?.bmi_value || null,
        category: lastRecord?.bmi_category || null,
        isUnderweight,
        hasBMIDrop,
      };
    }

    return {
      studentId,
      studentName,
      status: 'PENDING',
      lastUpdateDate: lastRecord?.recordedAt || null,
      lastBMI: lastRecord?.bmi_value || null,
      category: lastRecord?.bmi_category || null,
      isUnderweight,
      hasBMIDrop,
    };
  }

  if (isBefore(targetDate, new Date())) {
    return {
      studentId,
      studentName,
      status: 'OVERDUE',
      lastUpdateDate: lastRecord?.recordedAt || null,
      lastBMI: lastRecord?.bmi_value || null,
      category: lastRecord?.bmi_category || null,
      isUnderweight,
      hasBMIDrop,
    };
  }

  return {
    studentId,
    studentName,
    status: 'PENDING',
    lastUpdateDate: lastRecord?.recordedAt || null,
    lastBMI: lastRecord?.bmi_value || null,
    category: lastRecord?.bmi_category || null,
    isUnderweight,
    hasBMIDrop,
  };
};

export const getOverallBMIStatus = (
  students: Array<{ id: number; name: string }>,
  records: Array<{
    studentId: number;
    month: string;
    year: number;
    recordedAt: string;
    bmi_value: number;
    bmi_category: string;
  }>
): {
  status: BMIStatus;
  pendingCount: number;
  overdueCount: number;
  completedCount: number;
  criticalStudents: string[];
  studentStatuses: StudentBMIStatus[];
} => {
  const studentStatuses = students.map((student) =>
    getBMIStatusForMonth(student.id, student.name, records)
  );

  const pendingCount = studentStatuses.filter((s) => s.status === 'PENDING').length;
  const dueSoonCount = studentStatuses.filter((s) => s.status === 'DUE_SOON').length;
  const overdueCount = studentStatuses.filter((s) => s.status === 'OVERDUE').length;
  const completedCount = studentStatuses.filter((s) => s.status === 'COMPLETED').length;

  const criticalStudents = studentStatuses
    .filter((s) => s.isUnderweight || s.hasBMIDrop)
    .map((s) => s.studentName);

  let overallStatus: BMIStatus = 'COMPLETED';
  if (overdueCount > 0) {
    overallStatus = 'OVERDUE';
  } else if (dueSoonCount > 0) {
    overallStatus = 'DUE_SOON';
  } else if (pendingCount > 0) {
    overallStatus = 'PENDING';
  }

  return {
    status: overallStatus,
    pendingCount: pendingCount + dueSoonCount,
    overdueCount,
    completedCount,
    criticalStudents,
    studentStatuses,
  };
};

export const getStatusColor = (status: BMIStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-700 bg-green-50 border-green-300';
    case 'PENDING':
      return 'text-blue-700 bg-blue-50 border-blue-300';
    case 'DUE_SOON':
      return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    case 'OVERDUE':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-300';
  }
};

export const getStatusIcon = (status: BMIStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return '✅';
    case 'PENDING':
      return '⏳';
    case 'DUE_SOON':
      return '⚠️';
    case 'OVERDUE':
      return '🚨';
    default:
      return '❓';
  }
};
