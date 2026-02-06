import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import type { DashboardStats } from '../types';

type ActivityItem = {
  id: string;
  title: string;
  label: string;
  timeLabel: string;
  timestamp: number;
  accent: 'teal' | 'emerald' | 'amber' | 'rose' | 'slate';
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    totalDepartments: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) {
      return 'Unknown date';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Unknown date';
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimestamp = (value?: string) => {
    if (!value) {
      return 0;
    }
    const parsed = new Date(value);
    const timestamp = parsed.getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch employees
      const employeesRes = await api.get('/employees/');
      const employees = employeesRes.data.results || employeesRes.data || [];
      
      // Fetch leave requests
      const leavesRes = await api.get('/leave/leave-requests/');
      const leaves = leavesRes.data.results || leavesRes.data || [];
      
      // Fetch departments
      const deptsRes = await api.get('/employees/departments/');
      const departments = deptsRes.data.results || deptsRes.data || [];

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp: any) => emp.status === 'Active').length,
        pendingLeaves: leaves.filter((leave: any) => leave.status === 'Pending').length,
        totalDepartments: departments.length,
      });

      const employeeActivities = employees.map(
        (employee: any, index: number): ActivityItem => {
          const rawName =
            employee.full_name ||
            `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
          const name =
            rawName ||
            employee.email ||
            (employee.employee_id || employee.id
              ? `Employee ${employee.employee_id ?? employee.id}`
              : 'Employee');
          const createdAt = employee.created_at || employee.hire_date;

          return {
            id: `employee-${employee.employee_id ?? employee.id ?? employee.email ?? index}`,
            title: `Employee added: ${name}`,
            label: 'EMP',
            timeLabel: formatDate(createdAt),
            timestamp: getTimestamp(createdAt),
            accent: 'teal',
          };
        }
      );

      const leaveActivities = leaves.map(
        (leave: any, index: number): ActivityItem => {
          const employeeName =
            leave.employee_name || (leave.employee ? `Employee ${leave.employee}` : 'Employee');
          const status = leave.status || 'Pending';
          const createdAt = leave.created_at || leave.start_date;
          let accent: ActivityItem['accent'] = 'teal';

          if (status === 'Approved') {
            accent = 'emerald';
          } else if (status === 'Rejected') {
            accent = 'rose';
          } else if (status === 'Pending') {
            accent = 'amber';
          }

          return {
            id: `leave-${leave.leave_id ?? leave.id ?? index}`,
            title: `Leave ${String(status).toLowerCase()}: ${employeeName}`,
            label: 'LEV',
            timeLabel: formatDate(createdAt),
            timestamp: getTimestamp(createdAt),
            accent,
          };
        }
      );

      const recentActivities = [...employeeActivities, ...leaveActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      iconLabel: 'EMP',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      iconLabel: 'ACT',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      iconLabel: 'LEV',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      iconLabel: 'DEP',
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
    },
  ];

  const quickActions = [
    {
      id: 'add-employee',
      title: 'Add New Employee',
      description: 'Register a new team member',
      iconLabel: 'EMP',
      onClick: () => navigate('/employees'),
    },
    {
      id: 'review-leave',
      title: 'Review Leave Requests',
      description: 'Approve or reject leave',
      iconLabel: 'LEV',
      onClick: () => navigate('/leave'),
    },
    {
      id: 'manage-attendance',
      title: 'Manage Attendance',
      description: 'Track shifts and records',
      iconLabel: 'ATT',
      onClick: () => navigate('/attendance'),
    },
    {
      id: 'process-payroll',
      title: 'Process Payroll',
      description: 'Generate monthly payslips',
      iconLabel: 'PAY',
      onClick: () => navigate('/payroll'),
    },
  ];

  const activityStyles: Record<
    ActivityItem['accent'],
    { bg: string; text: string }
  > = {
    teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} rounded-xl p-4`}>
                  <span className={`text-sm font-semibold tracking-wider ${stat.textColor}`}>
                    {stat.iconLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Welcome to HRMS</h3>
          <p className="text-gray-600 mb-4">
            Your comprehensive Human Resource Management System. Use the navigation menu to access different modules and manage your organization efficiently.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Employee Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Leave & Attendance Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Payroll Processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Performance Reviews</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 text-left transition-all"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wider bg-white/20 rounded-md px-2 py-1">
                    {action.iconLabel}
                  </span>
                  <div>
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-sm text-white/80">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity yet.</p>
          ) : (
            activities.map((activity, index) => {
              const styles = activityStyles[activity.accent];
              const isLast = index === activities.length - 1;

              return (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 ${isLast ? '' : 'pb-4 border-b border-gray-100'}`}
                >
                  <div
                    className={`w-10 h-10 ${styles.bg} rounded-full flex items-center justify-center`}
                  >
                    <span className={`${styles.text} text-xs font-semibold`}>{activity.label}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.timeLabel}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
