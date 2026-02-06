import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Attendance, Timesheet, OvertimeRequest } from '../types';

type EmployeeAttendanceTab = 'attendance' | 'timesheets' | 'overtime';

const EmployeeAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EmployeeAttendanceTab>('attendance');
  const [records, setRecords] = useState<Attendance[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [overtimeForm, setOvertimeForm] = useState({
    date: '',
    hours: '',
    reason: '',
  });

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadAttendance = async () => {
    try {
      const response = await api.get('/attendance/');
      setRecords(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch attendance');
    }
  };

  const loadTimesheets = async () => {
    try {
      const response = await api.get('/attendance/timesheets/');
      setTimesheets(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch timesheets');
    }
  };

  const loadOvertimeRequests = async () => {
    try {
      const response = await api.get('/attendance/overtime-requests/');
      setOvertimeRequests(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch overtime requests');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadAttendance(), loadTimesheets(), loadOvertimeRequests()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOvertimeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      date: overtimeForm.date,
      hours: parseFloat(overtimeForm.hours),
      reason: overtimeForm.reason || null,
    };
    try {
      await api.post('/attendance/overtime-requests/', payload);
      toast.success('Overtime request submitted');
      setOvertimeForm({ date: '', hours: '', reason: '' });
      loadOvertimeRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit overtime request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-1">Track attendance, timesheets, and overtime requests</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'timesheets' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Timesheets
        </button>
        <button
          onClick={() => setActiveTab('overtime')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'overtime' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Overtime
        </button>
      </div>

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock In</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.attendance_id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.clock_in_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.clock_out_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.working_hours ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.status}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No attendance records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock In</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Overtime</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timesheets.map((sheet) => (
                  <tr key={sheet.timesheet_id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{sheet.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.clock_in_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.clock_out_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.working_hours ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.overtime_hours ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.status}</td>
                  </tr>
                ))}
                {timesheets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No timesheets available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overtime' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Overtime</h2>
            <form onSubmit={handleOvertimeSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={overtimeForm.date}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, date: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={overtimeForm.hours}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, hours: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={overtimeForm.reason}
                  onChange={(event) => setOvertimeForm({ ...overtimeForm, reason: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Submit Request
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overtimeRequests.map((request) => (
                    <tr key={request.overtime_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.hours}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{request.notes || request.reason || '-'}</td>
                    </tr>
                  ))}
                  {overtimeRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No overtime requests submitted.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
