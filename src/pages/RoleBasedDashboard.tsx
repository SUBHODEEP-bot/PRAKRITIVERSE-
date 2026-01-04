import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from './dashboards/StudentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import NGODashboard from './dashboards/NGODashboard';
import InstitutionDashboard from './dashboards/InstitutionDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const RoleBasedDashboard = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-green-800 mb-4">EcoLearn</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-2">Setting up your profile...</div>
          <p className="text-gray-600">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'ngo':
      return <NGODashboard />;
    case 'institution':
      return <InstitutionDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />; // Fallback to student dashboard
  }
};

export default RoleBasedDashboard;