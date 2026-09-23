import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import SupervisorDashboard from './components/SupervisorDashboard';
import AdminDashboard from './components/AdminDashboard';
import ReportPage from './components/ReportPage';
import BMITracker from './components/BMITracker';
import BMIMonitoringDashboard from './components/BMIMonitoringDashboard';
import { AlertCircle } from 'lucide-react';

type View = 'login' | 'change-password' | 'supervisor-dashboard' | 'admin-dashboard' | 'reports' | 'bmi-tracker' | 'admin-bmi-monitoring';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'superuser';
  school: number | null;
  school_name?: string;
  school_code?: string;
  password_change_required: boolean;
  is_superuser: boolean;
}

// 1. Add the interface to match what your AdminDashboard expects
interface SchoolData {
  id: number;
  name: string;
  location: string;
  nutritionScore: number;
  status: 'Safe' | 'Unsafe';
  attendance: number;
  lastUpdate: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // 2. Add state for schools
  const [schools, setSchools] = useState<SchoolData[]>([]);
  
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

  // 3. Fetch schools from your Django API
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/schools/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Ensure your Django view returns { "schools": [...] }
          setSchools(data.schools);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      }
    };

    if (userData?.role === 'admin') {
      fetchSchools();
    }
  }, [userData]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);

        if (user.is_superuser) {
          window.location.href = 'http://localhost:8000/admin/';
        } else if (user.password_change_required) {
          setCurrentView('change-password');
        } else if (user.role === 'supervisor') {
          setCurrentView('supervisor-dashboard');
        } else if (user.role === 'admin') {
          setCurrentView('admin-dashboard');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (user: UserData, redirectTo: string) => {
    setUserData(user);
    if (user.is_superuser) {
      window.location.href = 'http://localhost:8000/admin/';
      return;
    }
    if (redirectTo === '/change-password') {
      setCurrentView('change-password');
    } else if (redirectTo === '/supervisor-dashboard') {
      setCurrentView('supervisor-dashboard');
    } else if (redirectTo === '/admin-dashboard') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  const handlePasswordChanged = () => {
    if (userData) {
      const updatedUser = { ...userData, password_change_required: false };
      setUserData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    if (userData?.role === 'supervisor') {
      setCurrentView('supervisor-dashboard');
    } else if (userData?.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    setCurrentView('login');
    setSchools([]); // Clear schools on logout
    toast.success('Logged out successfully');
  };

  const checkAccess = (requiredRole: 'admin' | 'supervisor'): boolean => {
    if (!userData) {
      setCurrentView('login');
      return false;
    }
    if (userData.is_superuser) return true;
    if (userData.role !== requiredRole) {
      toast.error('Access Denied');
      return false;
    }
    return true;
  };

  const handleViewReports = () => {
    if (!checkAccess('admin')) return;
    setCurrentView('reports');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin-dashboard');
  };

  const handleOpenBMI = () => {
    if (!checkAccess('supervisor')) return;
    setCurrentView('bmi-tracker');
  };

  const handleBackToSupervisor = () => {
    setCurrentView('supervisor-dashboard');
  };

  const handleBMIRecordsUpdate = (records: any[]) => {
    setBmiRecords(records);
  };

  const handleViewBMIMonitoring = () => {
    if (!checkAccess('admin')) return;
    setCurrentView('admin-bmi-monitoring');
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="size-full">
        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'change-password' && userData && (
          <ChangePassword
            onPasswordChanged={handlePasswordChanged}
            userEmail={userData.email}
          />
        )}
        {currentView === 'supervisor-dashboard' && userData?.role === 'supervisor' && (
          <SupervisorDashboard
            onLogout={handleLogout}
            onOpenBMI={handleOpenBMI}
            bmiRecords={bmiRecords}
          />
        )}
        {currentView === 'admin-dashboard' && userData?.role === 'admin' && (
          <AdminDashboard
            onLogout={handleLogout}
            onViewReports={handleViewReports}
            onViewBMIMonitoring={handleViewBMIMonitoring}
            bmiRecords={bmiRecords}
            /* 4. Pass the fetched schools prop here */
            schools={schools} 
          />
        )}
        {currentView === 'reports' && userData?.role === 'admin' && (
          <ReportPage onBack={handleBackToAdmin} />
        )}
        {currentView === 'bmi-tracker' && userData?.role === 'supervisor' && (
          <BMITracker
            onBack={handleBackToSupervisor}
            initialRecords={bmiRecords}
            onRecordsUpdate={handleBMIRecordsUpdate}
          />
        )}
        {currentView === 'admin-bmi-monitoring' && userData?.role === 'admin' && (
          <BMIMonitoringDashboard onBack={handleBackToAdmin} />
        )}
      </div>
    </>
  );
}