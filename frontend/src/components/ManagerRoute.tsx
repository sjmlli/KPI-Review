import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactElement;
}

const ManagerRoute = ({ children }: Props) => {
  const { employeeProfile, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  const isManager = (employeeProfile?.direct_reports_count || 0) > 0 ||
    (employeeProfile?.role || '').toLowerCase() === 'manager';

  return isManager ? children : <Navigate to="/employee/profile" replace />;
};

export default ManagerRoute;
