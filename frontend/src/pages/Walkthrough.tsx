import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface WalkthroughStep {
  title: string;
  description: string;
  path: string;
  action: string;
}

const Walkthrough: React.FC = () => {
  const { portal, employeeProfile } = useAuth();
  const isManager = (employeeProfile?.direct_reports_count || 0) > 0;

  const adminSteps: WalkthroughStep[] = [
    {
      title: 'Login and open the dashboard',
      description: 'Review headcount, leaves, and attendance summary.',
      path: '/dashboard',
      action: 'Open Dashboard',
    },
    {
      title: 'Create employees and credentials',
      description: 'Add staff, set role/manager/team lead, and share login credentials.',
      path: '/employees',
      action: 'Go to Employees',
    },
    {
      title: 'Define org structure',
      description: 'Assign department managers and review org chart.',
      path: '/organization',
      action: 'Open Org Chart',
    },
    {
      title: 'Configure settings',
      description: 'Set SMTP for emails and upload the offer letter template.',
      path: '/settings',
      action: 'Open Settings',
    },
    {
      title: 'Generate offer letters',
      description: 'Use employee details to generate and download offer letters.',
      path: '/employees',
      action: 'Generate Offer Letter',
    },
    {
      title: 'Manage recruitment',
      description: 'Create job postings and track applications.',
      path: '/recruitment',
      action: 'Open Recruitment',
    },
    {
      title: 'Set attendance and biometric',
      description: 'Create shifts, assign employees, and configure biometric devices.',
      path: '/attendance',
      action: 'Open Attendance',
    },
    {
      title: 'Handle leave requests',
      description: 'Monitor leave balances and requests.',
      path: '/leave',
      action: 'Open Leave',
    },
    {
      title: 'Payroll and performance',
      description: 'Run payroll and performance reviews.',
      path: '/payroll',
      action: 'Open Payroll',
    },
  ];

  const managerSteps: WalkthroughStep[] = [
    {
      title: 'View your team',
      description: 'See who reports to you and their status.',
      path: '/employee/team',
      action: 'Open My Team',
    },
    {
      title: 'Approve leave',
      description: 'Review leave requests from your team and approve or reject.',
      path: '/employee/team-leaves',
      action: 'Open Team Leaves',
    },
    {
      title: 'Review your attendance',
      description: 'Check your attendance records and biometrics.',
      path: '/employee/attendance',
      action: 'Open My Attendance',
    },
  ];

  const employeeSteps: WalkthroughStep[] = [
    {
      title: 'View your profile',
      description: 'Verify your personal and employment details.',
      path: '/employee/profile',
      action: 'Open My Profile',
    },
    {
      title: 'Request leave',
      description: 'Submit leave requests and track status.',
      path: '/employee/leave',
      action: 'Open My Leave',
    },
    {
      title: 'Check attendance',
      description: 'Review your check-in and check-out history.',
      path: '/employee/attendance',
      action: 'Open My Attendance',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HRMS Walkthrough</h1>
        <p className="text-gray-600 mt-2">
          Use this checklist to verify each role flow end-to-end. Follow the steps in order to
          validate setup and daily operations.
        </p>
      </div>

      {portal !== 'Employee' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin / HR Walkthrough</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {adminSteps.map((step) => (
              <div key={step.title} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <Link
                  to={step.path}
                  className="inline-flex mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {step.action}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {isManager && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Manager Walkthrough</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {managerSteps.map((step) => (
              <div key={step.title} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <Link
                  to={step.path}
                  className="inline-flex mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {step.action}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {portal === 'Employee' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Employee Walkthrough</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {employeeSteps.map((step) => (
              <div key={step.title} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <Link
                  to={step.path}
                  className="inline-flex mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {step.action}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Walkthrough;
