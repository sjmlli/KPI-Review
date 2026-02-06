import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Employee, LeaveRequest, LeaveBalance, Holiday } from '../types';

type LeaveTab = 'requests' | 'balances' | 'holidays';

const leaveRequestTypes = ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid', 'Other'];
const leaveBalanceTypes = ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity'];
const leaveStatuses = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaveTab>('requests');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const [requestForm, setRequestForm] = useState({
    employee: '',
    leave_type: 'Sick',
    start_date: '',
    end_date: '',
    total_days: '',
    reason: '',
    status: 'Pending',
    rejection_reason: '',
  });

  const [balanceForm, setBalanceForm] = useState({
    employee: '',
    leave_type: 'Sick',
    balance: '',
    used: '',
    year: new Date().getFullYear().toString(),
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    is_active: true,
    description: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmployees(),
          fetchLeaveRequests(),
          fetchLeaveBalances(),
          fetchHolidays(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      setEmployees(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch employees');
    }
  };

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

  const fetchHolidays = async () => {
    try {
      const response = await api.get('/leave/holidays/');
      setHolidays(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch holidays');
    }
  };

  const resetRequestForm = () => {
    setRequestForm({
      employee: '',
      leave_type: 'Sick',
      start_date: '',
      end_date: '',
      total_days: '',
      reason: '',
      status: 'Pending',
      rejection_reason: '',
    });
    setEditingRequest(null);
  };

  const resetBalanceForm = () => {
    setBalanceForm({
      employee: '',
      leave_type: 'Sick',
      balance: '',
      used: '',
      year: new Date().getFullYear().toString(),
    });
    setEditingBalance(null);
  };

  const resetHolidayForm = () => {
    setHolidayForm({
      name: '',
      date: '',
      is_active: true,
      description: '',
    });
    setEditingHoliday(null);
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const basePayload = {
      employee: parseInt(requestForm.employee, 10),
      leave_type: requestForm.leave_type,
      start_date: requestForm.start_date,
      end_date: requestForm.end_date,
      total_days: parseInt(requestForm.total_days, 10),
      reason: requestForm.reason,
    };

    try {
      if (editingRequest) {
        await api.patch(`/leave/leave-requests/${editingRequest.leave_id}/`, {
          ...basePayload,
          status: requestForm.status,
          rejection_reason: requestForm.rejection_reason || null,
        });
        toast.success('Leave request updated');
      } else {
        await api.post('/leave/leave-requests/', basePayload);
        toast.success('Leave request created');
      }
      setShowRequestModal(false);
      resetRequestForm();
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save leave request');
    }
  };

  const handleBalanceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(balanceForm.employee, 10),
      leave_type: balanceForm.leave_type,
      balance: parseInt(balanceForm.balance, 10),
      used: parseInt(balanceForm.used || '0', 10),
      year: parseInt(balanceForm.year, 10),
    };

    try {
      if (editingBalance) {
        await api.patch(`/leave/leave-balances/${editingBalance.balance_id}/`, payload);
        toast.success('Leave balance updated');
      } else {
        await api.post('/leave/leave-balances/', payload);
        toast.success('Leave balance created');
      }
      setShowBalanceModal(false);
      resetBalanceForm();
      fetchLeaveBalances();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save leave balance');
    }
  };

  const handleHolidaySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: holidayForm.name,
      date: holidayForm.date,
      is_active: holidayForm.is_active,
      description: holidayForm.description || null,
    };

    try {
      if (editingHoliday) {
        await api.patch(`/leave/holidays/${editingHoliday.holiday_id}/`, payload);
        toast.success('Holiday updated');
      } else {
        await api.post('/leave/holidays/', payload);
        toast.success('Holiday created');
      }
      setShowHolidayModal(false);
      resetHolidayForm();
      fetchHolidays();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save holiday');
    }
  };

  const handleDeleteRequest = async (leaveId: number) => {
    if (!window.confirm('Delete this leave request?')) {
      return;
    }
    try {
      await api.delete(`/leave/leave-requests/${leaveId}/`);
      toast.success('Leave request deleted');
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete leave request');
    }
  };

  const handleDeleteBalance = async (balanceId: number) => {
    if (!window.confirm('Delete this leave balance?')) {
      return;
    }
    try {
      await api.delete(`/leave/leave-balances/${balanceId}/`);
      toast.success('Leave balance deleted');
      fetchLeaveBalances();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete leave balance');
    }
  };

  const handleDeleteHoliday = async (holidayId: number) => {
    if (!window.confirm('Delete this holiday?')) {
      return;
    }
    try {
      await api.delete(`/leave/holidays/${holidayId}/`);
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete holiday');
    }
  };

  const startEditRequest = (request: LeaveRequest) => {
    setEditingRequest(request);
    setRequestForm({
      employee: request.employee.toString(),
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      total_days: request.total_days.toString(),
      reason: request.reason,
      status: request.status,
      rejection_reason: request.rejection_reason || '',
    });
    setShowRequestModal(true);
  };

  const startEditBalance = (balance: LeaveBalance) => {
    setEditingBalance(balance);
    setBalanceForm({
      employee: balance.employee.toString(),
      leave_type: balance.leave_type,
      balance: balance.balance.toString(),
      used: balance.used.toString(),
      year: balance.year.toString(),
    });
    setShowBalanceModal(true);
  };

  const startEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      is_active: holiday.is_active,
      description: holiday.description || '',
    });
    setShowHolidayModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Track leave requests, balances, and holidays</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'requests' && (
            <button
              onClick={() => {
                resetRequestForm();
                setShowRequestModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Leave Request
            </button>
          )}
          {activeTab === 'balances' && (
            <button
              onClick={() => {
                resetBalanceForm();
                setShowBalanceModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Leave Balance
            </button>
          )}
          {activeTab === 'holidays' && (
            <button
              onClick={() => {
                resetHolidayForm();
                setShowHolidayModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Holiday
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'balances' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Leave Balances
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'holidays' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Holidays
        </button>
      </div>

      {activeTab === 'requests' && (
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
                {leaveRequests.map((request) => (
                  <tr key={request.leave_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.employee_name || request.employee}</p>
                        <p className="text-sm text-gray-500">{request.reason}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{request.start_date}</div>
                      <div>{request.end_date}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.leave_type}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditRequest(request)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.leave_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaveRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveBalances.map((balance) => (
                  <tr key={balance.balance_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{balance.employee_name || balance.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{balance.leave_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {balance.balance} total, {balance.used} used
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{balance.year}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditBalance(balance)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBalance(balance.balance_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leaveBalances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No leave balances found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Holiday</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {holidays.map((holiday) => (
                  <tr key={holiday.holiday_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{holiday.name}</p>
                        <p className="text-sm text-gray-500">{holiday.description || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{holiday.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {holiday.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditHoliday(holiday)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.holiday_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {holidays.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No holidays found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRequest ? 'Edit Leave Request' : 'Add Leave Request'}
              </h2>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  resetRequestForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    required
                    value={requestForm.employee}
                    onChange={(event) => setRequestForm({ ...requestForm, employee: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={requestForm.leave_type}
                    onChange={(event) => setRequestForm({ ...requestForm, leave_type: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {leaveRequestTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={requestForm.total_days}
                    onChange={(event) => setRequestForm({ ...requestForm, total_days: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
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
              {editingRequest && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={requestForm.status}
                      onChange={(event) => setRequestForm({ ...requestForm, status: event.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {leaveStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                    <input
                      type="text"
                      value={requestForm.rejection_reason}
                      onChange={(event) => setRequestForm({ ...requestForm, rejection_reason: event.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    resetRequestForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingRequest ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBalance ? 'Edit Leave Balance' : 'Add Leave Balance'}
              </h2>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  resetBalanceForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleBalanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={balanceForm.employee}
                  onChange={(event) => setBalanceForm({ ...balanceForm, employee: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={balanceForm.leave_type}
                    onChange={(event) => setBalanceForm({ ...balanceForm, leave_type: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {leaveBalanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    required
                    value={balanceForm.year}
                    onChange={(event) => setBalanceForm({ ...balanceForm, year: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Balance</label>
                  <input
                    type="number"
                    required
                    value={balanceForm.balance}
                    onChange={(event) => setBalanceForm({ ...balanceForm, balance: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Used</label>
                  <input
                    type="number"
                    value={balanceForm.used}
                    onChange={(event) => setBalanceForm({ ...balanceForm, used: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBalanceModal(false);
                    resetBalanceForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingBalance ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
              </h2>
              <button
                onClick={() => {
                  setShowHolidayModal(false);
                  resetHolidayForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  required
                  value={holidayForm.name}
                  onChange={(event) => setHolidayForm({ ...holidayForm, name: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={holidayForm.date}
                    onChange={(event) => setHolidayForm({ ...holidayForm, date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="holiday-active"
                    type="checkbox"
                    checked={holidayForm.is_active}
                    onChange={(event) => setHolidayForm({ ...holidayForm, is_active: event.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="holiday-active" className="text-sm text-gray-700">
                    Active holiday
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={holidayForm.description}
                  onChange={(event) => setHolidayForm({ ...holidayForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowHolidayModal(false);
                    resetHolidayForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingHoliday ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
