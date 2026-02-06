import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';

type OrgChartManager = {
  manager_id: number;
  manager_name: string;
  manager_email: string;
  designation: string;
  team: {
    employee_id: number;
    full_name?: string;
    email: string;
    designation: string;
    department_name?: string;
  }[];
};

const Organization: React.FC = () => {
  const [orgChart, setOrgChart] = useState<OrgChartManager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgChart = async () => {
      setLoading(true);
      try {
        const response = await api.get('/employees/org_chart/');
        setOrgChart(response.data || []);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load org chart');
      } finally {
        setLoading(false);
      }
    };
    loadOrgChart();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading org chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
        <p className="text-gray-600 mt-1">Managers and their direct reports</p>
      </div>

      <div className="space-y-4">
        {orgChart.map((manager) => (
          <div key={manager.manager_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{manager.manager_name}</h2>
                <p className="text-sm text-gray-600">{manager.designation}</p>
                <p className="text-xs text-gray-500">{manager.manager_email}</p>
              </div>
              <span className="text-xs text-gray-500">{manager.team.length} team member(s)</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {manager.team.map((member) => (
                <div key={member.employee_id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {member.full_name || 'Employee'}
                  </p>
                  <p className="text-xs text-gray-500">{member.designation}</p>
                  <p className="text-xs text-gray-500">{member.department_name || 'N/A'}</p>
                </div>
              ))}
              {manager.team.length === 0 && (
                <div className="text-sm text-gray-500">No team members assigned.</div>
              )}
            </div>
          </div>
        ))}
        {orgChart.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
            No managers assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Organization;
