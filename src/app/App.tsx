import { useState } from 'react';
import { Toaster } from 'sonner';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ReportPage from './components/ReportPage';
import BMITracker from './components/BMITracker';
import BMIMonitoringDashboard from './components/BMIMonitoringDashboard';

type UserRole = 'admin' | 'teacher' | null;
type View = 'login' | 'teacher-dashboard' | 'admin-dashboard' | 'reports' | 'bmi-tracker' | 'admin-bmi-monitoring';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [schoolId, setSchoolId] = useState<number>(0);
  const [bmiRecords, setBmiRecords] = useState<Array<{
    studentId: number;
    month: string;
    year: number;
    recordedAt: string;
    bmi_value: number;
    bmi_category: string;
    height_cm: number;
    weight_kg: number;
  }>>([]);

  const handleLogin = (role: UserRole, school: number) => {
    setUserRole(role);
    setSchoolId(school);
    if (role === 'teacher') {
      setCurrentView('teacher-dashboard');
    } else {
      setCurrentView('admin-dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setSchoolId(0);
    setCurrentView('login');
  };

  const handleViewReports = () => {
    setCurrentView('reports');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin-dashboard');
  };

  const handleOpenBMI = () => {
    setCurrentView('bmi-tracker');
  };

  const handleBackToTeacher = () => {
    setCurrentView('teacher-dashboard');
  };

  const handleBMIRecordsUpdate = (records: any[]) => {
    setBmiRecords(records);
  };

  const handleViewBMIMonitoring = () => {
    setCurrentView('admin-bmi-monitoring');
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="size-full">
        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'teacher-dashboard' && (
          <TeacherDashboard
            onLogout={handleLogout}
            onOpenBMI={handleOpenBMI}
            bmiRecords={bmiRecords}
          />
        )}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onLogout={handleLogout}
            onViewReports={handleViewReports}
            onViewBMIMonitoring={handleViewBMIMonitoring}
            bmiRecords={bmiRecords}
          />
        )}
        {currentView === 'reports' && <ReportPage onBack={handleBackToAdmin} />}
        {currentView === 'bmi-tracker' && (
          <BMITracker
            onBack={handleBackToTeacher}
            initialRecords={bmiRecords}
            onRecordsUpdate={handleBMIRecordsUpdate}
          />
        )}
        {currentView === 'admin-bmi-monitoring' && (
          <BMIMonitoringDashboard onBack={handleBackToAdmin} />
        )}
      </div>
    </>
  );
}