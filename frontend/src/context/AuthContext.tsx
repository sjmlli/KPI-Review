import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import api, { AUTH_BASE_URL } from '../config/api';
import type { User, AuthContextType, Employee } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [portal, setPortal] = useState<'Admin' | 'Employee' | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        setIsAuthenticated(true);
        await loadProfile();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await api.get('/employees/me/');
      setEmployeeProfile(response.data);
      const resolvedRole = response.data.role || 'Employee';
      const resolvedPortal = response.data.role_portal || 'Employee';
      setRole(resolvedRole);
      setPortal(resolvedPortal);
      return { role: resolvedRole, portal: resolvedPortal };
    } catch (error) {
      setEmployeeProfile(null);
      setRole('Admin');
      setPortal('Admin');
      return { role: 'Admin', portal: 'Admin' };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/api/token/`, {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setIsAuthenticated(true);
      const resolvedProfile = await loadProfile();
      return { success: true, role: resolvedProfile.role, portal: resolvedProfile.portal };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setEmployeeProfile(null);
    setIsAuthenticated(false);
    setRole(null);
    setPortal(null);
  };

  const value: AuthContextType = {
    user,
    employeeProfile,
    isAuthenticated,
    loading,
    role,
    portal,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
