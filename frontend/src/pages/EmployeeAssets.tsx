import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { AssetAssignment } from '../types';

const EmployeeAssets: React.FC = () => {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hr/asset-assignments/');
      setAssignments(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
        <p className="text-gray-600 mt-1">View assets assigned to you</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{assignment.asset_tag}</p>
              <p className="text-sm text-gray-600">Assigned on {assignment.assigned_at?.slice(0, 10)}</p>
              {assignment.returned_at && (
                <p className="text-xs text-gray-500">Returned on {assignment.returned_at.slice(0, 10)}</p>
              )}
            </div>
          ))}
          {assignments.length === 0 && <p className="text-sm text-gray-500">No assets assigned yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAssets;
