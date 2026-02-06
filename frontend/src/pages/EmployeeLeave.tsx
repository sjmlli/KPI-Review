import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import type { LeaveRequest, LeaveBalance } from '../types';

const leaveTypes = ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid', 'Other'];

const EmployeeLeave: React.FC = () => {
  const { employeeProfile } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leave_type: 'Sick',
    start_date: '',
    end_date: '',
    total_days: '',
    reason: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchLeaveRequests(), fetchLeaveBalances()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leave/leave-requests/');
      setLeaveRequests(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch leave requests');
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const response = await api.get('/leave/leave-balances/');
      setLeaveBalances(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch leave balances');
    }
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeProfile) {
      toast.error('Employee profile not loaded.');
      return;
    }
    const payload = {
      employee: employeeProfile.employee_id,
      leave_type: requestForm.leave_type,
      start_date: requestForm.start_date,
      end_date: requestForm.end_date,
      total_days: parseInt(requestForm.total_days, 10),
      reason: requestForm.reason,
    };

    try {
      await api.post('/leave/leave-requests/', payload);
      toast.success('Leave request submitted');
      setShowRequestModal(false);
      setRequestForm({
        leave_type: 'Sick',
        start_date: '',
        end_date: '',
        total_days: '',
        reason: '',
      });
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit leave request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave</h1>
          <p className="text-gray-600 mt-1">View balances and submit leave requests</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Request Leave
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveBalances.map((balance) => (
            <div key={balance.balance_id} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">{balance.leave_type}</p>
              <p className="text-2xl font-bold text-gray-900">{balance.available ?? balance.balance - balance.used}</p>
              <p className="text-xs text-gray-500 mt-1">
                {balance.balance} total, {balance.used} used
              </p>
            </div>
          ))}
          {leaveBalances.length === 0 && (
            <p className="text-sm text-gray-500">No leave balances available.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request.leave_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.leave_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {request.start_date} - {request.end_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.reason}</td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No leave requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select
                  value={requestForm.leave_type}
                  onChange={(event) => setRequestForm({ ...requestForm, leave_type: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    value={requestForm.start_date}
                    onChange={(event) => setRequestForm({ ...requestForm, start_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    value={requestForm.end_date}
                    onChange={(event) => setRequestForm({ ...requestForm, end_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={requestForm.total_days}
                  onChange={(event) => setRequestForm({ ...requestForm, total_days: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  required
                  value={requestForm.reason}
                  onChange={(event) => setRequestForm({ ...requestForm, reason: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
