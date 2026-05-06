export interface SchoolBMIStatus {
  id: number;
  schoolName: string;
  location: string;
  totalStudents: number;
  studentsWithBMI: number;
  pendingBMI: number;
  lastUpdateDate: string | null;
  currentMonthUpdated: boolean;
  completionPercentage: number;
  complianceStatus: 'Compliant' | 'Partially Compliant' | 'Non-Compliant';
  lowBMICount: number;
  overdueStudents: number;
}

export interface StudentBMIStatus {
  id: number;
  name: string;
  lastBMI: number | null;
  bmiCategory: string | null;
  lastUpdateDate: string | null;
  status: 'Updated' | 'Pending' | 'Overdue';
  isUnderweight: boolean;
  hasBMIDrop: boolean;
}

export interface DashboardSummary {
  totalSchools: number;
  fullyCompliantSchools: number;
  partiallyCompliantSchools: number;
  nonCompliantSchools: number;
  totalPendingStudents: number;
  schoolsRequiringAction: number;
}
