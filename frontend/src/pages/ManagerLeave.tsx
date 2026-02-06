import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { LeaveRequest } from '../types';

const ManagerLeave: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/leave/leave-requests/');
      setRequests(response.data.results || response.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load leave requests');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (request: LeaveRequest, status: 'Approved' | 'Rejected') => {
    try {
      await api.patch(`/leave/leave-requests/${request.leave_id}/`, {
        status,
      });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || error?.message || 'Failed to update leave');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Leave Requests</h1>
        <p className="text-gray-600 mt-1">Approve or reject leave requests from your team</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.leave_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{request.employee_name || request.employee}</div>
                    <div className="text-xs text-gray-500">{request.reason}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{request.start_date}</div>
                    <div>{request.end_date}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.leave_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.status}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(request, 'Approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(request, 'Rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No leave requests for your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerLeave;
