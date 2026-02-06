import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface EmployeeRouteProps {
  children: ReactNode;
}

const EmployeeRoute: React.FC<EmployeeRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, portal } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (portal !== 'Employee') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default EmployeeRoute;
