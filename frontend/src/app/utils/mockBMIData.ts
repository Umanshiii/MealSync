import { SchoolBMIStatus, StudentBMIStatus, DashboardSummary } from '../types/bmiAdmin';

export const mockSchoolBMIData: SchoolBMIStatus[] = [
  {
    id: 1,
    schoolName: 'Sunrise Public School',
    location: 'Mumbai',
    totalStudents: 120,
    studentsWithBMI: 118,
    pendingBMI: 2,
    lastUpdateDate: '2026-05-05',
    currentMonthUpdated: true,
    completionPercentage: 98,
    complianceStatus: 'Compliant',
    lowBMICount: 3,
    overdueStudents: 0,
  },
  {
    id: 2,
    schoolName: 'Green Valley School',
    location: 'Delhi',
    totalStudents: 95,
    studentsWithBMI: 65,
    pendingBMI: 30,
    lastUpdateDate: '2026-04-28',
    currentMonthUpdated: false,
    completionPercentage: 68,
    complianceStatus: 'Partially Compliant',
    lowBMICount: 5,
    overdueStudents: 15,
  },
  {
    id: 3,
    schoolName: 'River View Academy',
    location: 'Bangalore',
    totalStudents: 150,
    studentsWithBMI: 0,
    pendingBMI: 150,
    lastUpdateDate: null,
    currentMonthUpdated: false,
    completionPercentage: 0,
    complianceStatus: 'Non-Compliant',
    lowBMICount: 0,
    overdueStudents: 150,
  },
  {
    id: 4,
    schoolName: 'Mountain Peak School',
    location: 'Pune',
    totalStudents: 110,
    studentsWithBMI: 110,
    pendingBMI: 0,
    lastUpdateDate: '2026-05-06',
    currentMonthUpdated: true,
    completionPercentage: 100,
    complianceStatus: 'Compliant',
    lowBMICount: 2,
    overdueStudents: 0,
  },
  {
    id: 5,
    schoolName: 'City Central School',
    location: 'Hyderabad',
    totalStudents: 88,
    studentsWithBMI: 40,
    pendingBMI: 48,
    lastUpdateDate: '2026-04-22',
    currentMonthUpdated: false,
    completionPercentage: 45,
    complianceStatus: 'Partially Compliant',
    lowBMICount: 8,
    overdueStudents: 25,
  },
  {
    id: 6,
    schoolName: 'Heritage Public School',
    location: 'Chennai',
    totalStudents: 130,
    studentsWithBMI: 128,
    pendingBMI: 2,
    lastUpdateDate: '2026-05-04',
    currentMonthUpdated: true,
    completionPercentage: 98,
    complianceStatus: 'Compliant',
    lowBMICount: 4,
    overdueStudents: 0,
  },
  {
    id: 7,
    schoolName: 'Lakeside Primary',
    location: 'Kolkata',
    totalStudents: 75,
    studentsWithBMI: 25,
    pendingBMI: 50,
    lastUpdateDate: '2026-04-15',
    currentMonthUpdated: false,
    completionPercentage: 33,
    complianceStatus: 'Non-Compliant',
    lowBMICount: 6,
    overdueStudents: 50,
  },
  {
    id: 8,
    schoolName: 'Golden Heights School',
    location: 'Ahmedabad',
    totalStudents: 105,
    studentsWithBMI: 103,
    pendingBMI: 2,
    lastUpdateDate: '2026-05-05',
    currentMonthUpdated: true,
    completionPercentage: 98,
    complianceStatus: 'Compliant',
    lowBMICount: 1,
    overdueStudents: 0,
  },
];

export const getMockStudentBMIData = (schoolId: number): StudentBMIStatus[] => {
  const baseStudents = [
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

  const school = mockSchoolBMIData.find((s) => s.id === schoolId);
  if (!school) return [];

  const updatedCount = school.studentsWithBMI;

  return baseStudents.slice(0, Math.min(school.totalStudents, 10)).map((student, index) => {
    const isUpdated = index < updatedCount;
    const isOverdue = !isUpdated && school.overdueStudents > 0;

    return {
      id: student.id,
      name: student.name,
      lastBMI: isUpdated ? Math.random() * 10 + 16 : null,
      bmiCategory: isUpdated
        ? Math.random() > 0.7
          ? 'Underweight'
          : Math.random() > 0.5
          ? 'Normal'
          : 'Overweight'
        : null,
      lastUpdateDate: isUpdated ? '2026-05-05' : null,
      status: isUpdated ? 'Updated' : isOverdue ? 'Overdue' : 'Pending',
      isUnderweight: isUpdated && Math.random() > 0.8,
      hasBMIDrop: isUpdated && Math.random() > 0.9,
    };
  });
};

export const getDashboardSummary = (schools: SchoolBMIStatus[]): DashboardSummary => {
  return {
    totalSchools: schools.length,
    fullyCompliantSchools: schools.filter((s) => s.complianceStatus === 'Compliant').length,
    partiallyCompliantSchools: schools.filter((s) => s.complianceStatus === 'Partially Compliant').length,
    nonCompliantSchools: schools.filter((s) => s.complianceStatus === 'Non-Compliant').length,
    totalPendingStudents: schools.reduce((acc, s) => acc + s.pendingBMI, 0),
    schoolsRequiringAction: schools.filter(
      (s) => s.complianceStatus !== 'Compliant' || s.lowBMICount > 5 || s.overdueStudents > 0
    ).length,
  };
};
