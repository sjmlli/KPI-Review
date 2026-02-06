import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import AdminRoute from './components/AdminRoute';
import EmployeeRoute from './components/EmployeeRoute';
import ManagerRoute from './components/ManagerRoute';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import LeaveManagement from './pages/LeaveManagement';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import MyReviews from './pages/MyReviews';
import ReviewDetail from './pages/ReviewDetail';
import TeamReviews from './pages/TeamReviews';
import Recruitment from './pages/Recruitment';
import EmployeeLeave from './pages/EmployeeLeave';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import EmployeeAssets from './pages/EmployeeAssets';
import EmployeePolicies from './pages/EmployeePolicies';
import EmployeePayroll from './pages/EmployeePayroll';
import ManagerTeam from './pages/ManagerTeam';
import ManagerLeave from './pages/ManagerLeave';
import Settings from './pages/Settings';
import Organization from './pages/Organization';
import Walkthrough from './pages/Walkthrough';
import Onboarding from './pages/Onboarding';
import Assets from './pages/Assets';
import Policies from './pages/Policies';
import CompanyProfile from './pages/CompanyProfile';
import './index.css';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<CompanyProfile />} />
      <Route path="/company" element={<Navigate to="/" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <AdminRoute>
            <Layout>
              <Employees />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/organization"
        element={
          <AdminRoute>
            <Layout>
              <Organization />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <AdminRoute>
            <Layout>
              <Onboarding />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <AdminRoute>
            <Layout>
              <Assets />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/policies"
        element={
          <AdminRoute>
            <Layout>
              <Policies />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <AdminRoute>
            <Layout>
              <LeaveManagement />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <AdminRoute>
            <Layout>
              <Attendance />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <AdminRoute>
            <Layout>
              <Payroll />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <AdminRoute>
            <Layout>
              <Performance />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/recruitment"
        element={
          <AdminRoute>
            <Layout>
              <Recruitment />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <AdminRoute>
            <Layout>
              <Settings />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/walkthrough"
        element={
          <PrivateRoute>
            <Layout>
              <Walkthrough />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeeProfile />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/leave"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeeLeave />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeeAttendance />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/onboarding"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeeOnboarding />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/assets"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeeAssets />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/policies"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeePolicies />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/payroll"
        element={
          <EmployeeRoute>
            <Layout>
              <EmployeePayroll />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/reviews"
        element={
          <EmployeeRoute>
            <Layout>
              <MyReviews />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/reviews/:id"
        element={
          <EmployeeRoute>
            <Layout>
              <ReviewDetail />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/team-reviews"
        element={
          <EmployeeRoute>
            <ManagerRoute>
              <Layout>
                <TeamReviews />
              </Layout>
            </ManagerRoute>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/team"
        element={
          <EmployeeRoute>
            <Layout>
              <ManagerTeam />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/team-leaves"
        element={
          <EmployeeRoute>
            <Layout>
              <ManagerLeave />
            </Layout>
          </EmployeeRoute>
        }
      />
      <Route path="/employee" element={<Navigate to="/employee/profile" replace />} />
    </Routes>
  );
}

function AppShell() {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </Router>
    </AuthProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;
