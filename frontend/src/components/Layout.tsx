import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, portal, employeeProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'DB' },
    { path: '/employees', label: 'Employees', icon: 'EMP' },
    { path: '/organization', label: 'Org Chart', icon: 'ORG' },
    { path: '/onboarding', label: 'Onboarding', icon: 'ONB' },
    { path: '/assets', label: 'Assets', icon: 'AST' },
    { path: '/policies', label: 'Policies', icon: 'POL' },
    { path: '/leave', label: 'Leave Management', icon: 'LEA' },
    { path: '/attendance', label: 'Attendance', icon: 'ATT' },
    { path: '/payroll', label: 'Payroll', icon: 'PAY' },
    { path: '/performance', label: 'Performance', icon: 'PER' },
    { path: '/recruitment', label: 'Recruitment', icon: 'REC' },
    { path: '/settings', label: 'Settings', icon: 'SET' },
    { path: '/walkthrough', label: 'Walkthrough', icon: 'HOW' },
  ];
  const isManager = (employeeProfile?.direct_reports_count || 0) > 0;
  const employeeMenuItems: MenuItem[] = [
    { path: '/employee/profile', label: 'My Profile', icon: 'ME' },
    { path: '/employee/onboarding', label: 'My Onboarding', icon: 'ONB' },
    { path: '/employee/leave', label: 'My Leave', icon: 'LEA' },
    { path: '/employee/attendance', label: 'My Attendance', icon: 'ATT' },
    { path: '/employee/payroll', label: 'My Payroll', icon: 'PAY' },
    { path: '/employee/assets', label: 'My Assets', icon: 'AST' },
    { path: '/employee/policies', label: 'Policies', icon: 'POL' },
    { path: '/employee/reviews', label: 'My Reviews', icon: 'REV' },
    ...(isManager
      ? [
          { path: '/employee/team-reviews', label: 'Team Reviews', icon: 'PER' },
          { path: '/employee/team', label: 'My Team', icon: 'TEAM' },
          { path: '/employee/team-leaves', label: 'Team Leaves', icon: 'APP' },
        ]
      : []),
    { path: '/walkthrough', label: 'Walkthrough', icon: 'HOW' },
  ];

  const menuItems = portal === 'Employee' ? employeeMenuItems : adminMenuItems;

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    // Treat nested routes as active (e.g., /employee/reviews/123 should keep /employee/reviews highlighted)
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div
        className={`app-sidebar text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center">
                <span className="text-emerald-900 font-bold text-xl">H</span>
              </div>
              <h1 className="text-xl font-bold">HRMS</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/80 hover:bg-white/10 p-2 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-white text-indigo-900 shadow-lg'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="app-header shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find((item) => isActive(item.path))?.label || 'HRMS'}
            </h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {portal !== 'Employee' && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">A</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 app-content animate-rise">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
