import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type {
  Employee,
  Attendance,
  Shift,
  EmployeeShift,
  BiometricIntegration,
  BiometricPunch,
  Timesheet,
  OvertimeRequest,
} from '../types';

type AttendanceTab = 'records' | 'shifts' | 'assignments' | 'biometric' | 'timesheets' | 'overtime';

const attendanceStatuses = ['Present', 'Absent', 'Leave', 'Half Day'];
const biometricProviders: BiometricIntegration['provider'][] = [
  'ZKTeco',
  'eSSL',
  'BioStar',
  'Suprema',
  'Generic',
];
const biometricConnectionTypes: BiometricIntegration['connection_type'][] = ['Webhook', 'Polling'];

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>('records');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShift[]>([]);
  const [biometricIntegrations, setBiometricIntegrations] = useState<BiometricIntegration[]>([]);
  const [biometricPunches, setBiometricPunches] = useState<BiometricPunch[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<EmployeeShift | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<BiometricIntegration | null>(null);

  const [recordForm, setRecordForm] = useState({
    employee: '',
    date: '',
    clock_in_time: '',
    clock_out_time: '',
    working_hours: '',
    status: 'Present',
    notes: '',
  });

  const [shiftForm, setShiftForm] = useState({
    name: '',
    start_time: '',
    end_time: '',
    break_duration: '60',
    description: '',
    is_active: true,
  });

  const [assignmentForm, setAssignmentForm] = useState({
    employee: '',
    shift: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [integrationForm, setIntegrationForm] = useState({
    provider: 'Generic' as BiometricIntegration['provider'],
    display_name: '',
    connection_type: 'Webhook' as BiometricIntegration['connection_type'],
    base_url: '',
    device_id: '',
    employee_identifier_field: 'employee_id',
    employee_identifier_type: 'employee_id',
    timestamp_field: 'timestamp',
    direction_field: 'direction',
    credentials: {
      api_key: '',
      username: '',
      password: '',
    },
    is_active: true,
    auto_sync: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEmployees(),
          fetchAttendance(),
          fetchShifts(),
          fetchAssignments(),
          fetchBiometricIntegrations(),
          fetchBiometricPunches(),
          fetchTimesheets(),
          fetchOvertimeRequests(),
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

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/');
      setAttendanceRecords(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch attendance records');
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await api.get('/attendance/shifts/');
      setShifts(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch shifts');
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/attendance/employee-shifts/');
      setEmployeeShifts(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch employee shifts');
    }
  };

  const fetchBiometricIntegrations = async () => {
    try {
      const response = await api.get('/attendance/biometric-integrations/');
      setBiometricIntegrations(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch biometric integrations');
    }
  };

  const fetchBiometricPunches = async () => {
    try {
      const response = await api.get('/attendance/biometric-punches/');
      setBiometricPunches(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch biometric logs');
    }
  };

  const fetchTimesheets = async () => {
    try {
      const response = await api.get('/attendance/timesheets/');
      setTimesheets(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch timesheets');
    }
  };

  const fetchOvertimeRequests = async () => {
    try {
      const response = await api.get('/attendance/overtime-requests/');
      setOvertimeRequests(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch overtime requests');
    }
  };

  const resetRecordForm = () => {
    setRecordForm({
      employee: '',
      date: '',
      clock_in_time: '',
      clock_out_time: '',
      working_hours: '',
      status: 'Present',
      notes: '',
    });
    setEditingRecord(null);
  };

  const resetShiftForm = () => {
    setShiftForm({
      name: '',
      start_time: '',
      end_time: '',
      break_duration: '60',
      description: '',
      is_active: true,
    });
    setEditingShift(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      employee: '',
      shift: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingAssignment(null);
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      provider: 'Generic',
      display_name: '',
      connection_type: 'Webhook',
      base_url: '',
      device_id: '',
      employee_identifier_field: 'employee_id',
      employee_identifier_type: 'employee_id',
      timestamp_field: 'timestamp',
      direction_field: 'direction',
      credentials: {
        api_key: '',
        username: '',
        password: '',
      },
      is_active: true,
      auto_sync: true,
    });
    setEditingIntegration(null);
  };

  const handleRecordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(recordForm.employee, 10),
      date: recordForm.date,
      clock_in_time: recordForm.clock_in_time || null,
      clock_out_time: recordForm.clock_out_time || null,
      working_hours: recordForm.working_hours ? parseFloat(recordForm.working_hours) : 0,
      status: recordForm.status,
      notes: recordForm.notes || null,
    };

    try {
      if (editingRecord) {
        await api.patch(`/attendance/${editingRecord.attendance_id}/`, payload);
        toast.success('Attendance updated');
      } else {
        await api.post('/attendance/', payload);
        toast.success('Attendance record created');
      }
      setShowRecordModal(false);
      resetRecordForm();
      fetchAttendance();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save attendance record');
    }
  };

  const handleShiftSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: shiftForm.name,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      break_duration: parseInt(shiftForm.break_duration, 10),
      description: shiftForm.description || null,
      is_active: shiftForm.is_active,
    };

    try {
      if (editingShift) {
        await api.patch(`/attendance/shifts/${editingShift.shift_id}/`, payload);
        toast.success('Shift updated');
      } else {
        await api.post('/attendance/shifts/', payload);
        toast.success('Shift created');
      }
      setShowShiftModal(false);
      resetShiftForm();
      fetchShifts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save shift');
    }
  };

  const handleAssignmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(assignmentForm.employee, 10),
      shift: parseInt(assignmentForm.shift, 10),
      start_date: assignmentForm.start_date,
      end_date: assignmentForm.end_date || null,
      is_active: assignmentForm.is_active,
    };

    try {
      if (editingAssignment) {
        await api.patch(`/attendance/employee-shifts/${editingAssignment.id}/`, payload);
        toast.success('Employee shift updated');
      } else {
        await api.post('/attendance/employee-shifts/', payload);
        toast.success('Employee shift created');
      }
      setShowAssignmentModal(false);
      resetAssignmentForm();
      fetchAssignments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save employee shift');
    }
  };

  const handleDeleteRecord = async (attendanceId: number) => {
    if (!window.confirm('Delete this attendance record?')) {
      return;
    }
    try {
      await api.delete(`/attendance/${attendanceId}/`);
      toast.success('Attendance record deleted');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete attendance record');
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!window.confirm('Delete this shift?')) {
      return;
    }
    try {
      await api.delete(`/attendance/shifts/${shiftId}/`);
      toast.success('Shift deleted');
      fetchShifts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete shift');
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm('Delete this assignment?')) {
      return;
    }
    try {
      await api.delete(`/attendance/employee-shifts/${assignmentId}/`);
      toast.success('Employee shift deleted');
      fetchAssignments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete employee shift');
    }
  };

  const startEditRecord = (record: Attendance) => {
    setEditingRecord(record);
    setRecordForm({
      employee: record.employee.toString(),
      date: record.date,
      clock_in_time: record.clock_in_time || '',
      clock_out_time: record.clock_out_time || '',
      working_hours: record.working_hours?.toString() || '',
      status: record.status,
      notes: record.notes || '',
    });
    setShowRecordModal(true);
  };

  const startEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      break_duration: shift.break_duration.toString(),
      description: shift.description || '',
      is_active: shift.is_active,
    });
    setShowShiftModal(true);
  };

  const startEditAssignment = (assignment: EmployeeShift) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      employee: assignment.employee.toString(),
      shift: assignment.shift.toString(),
      start_date: assignment.start_date,
      end_date: assignment.end_date || '',
      is_active: assignment.is_active,
    });
    setShowAssignmentModal(true);
  };

  const startEditIntegration = (integration: BiometricIntegration) => {
    const mapping = integration.data_mapping || {};
    setEditingIntegration(integration);
    setIntegrationForm({
      provider: integration.provider,
      display_name: integration.display_name,
      connection_type: integration.connection_type,
      base_url: integration.base_url || '',
      device_id: integration.device_id || '',
      employee_identifier_field: mapping.employee_identifier_field || 'employee_id',
      employee_identifier_type: mapping.employee_identifier_type || 'employee_id',
      timestamp_field: mapping.timestamp_field || 'timestamp',
      direction_field: mapping.direction_field || 'direction',
      credentials: {
        api_key: '',
        username: '',
        password: '',
      },
      is_active: integration.is_active,
      auto_sync: integration.auto_sync,
    });
    setShowBiometricModal(true);
  };

  const handleIntegrationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data_mapping = {
      employee_identifier_field: integrationForm.employee_identifier_field,
      employee_identifier_type: integrationForm.employee_identifier_type,
      timestamp_field: integrationForm.timestamp_field,
      direction_field: integrationForm.direction_field,
    };
    const credentials: Record<string, string> = {};
    if (integrationForm.credentials.api_key) credentials.api_key = integrationForm.credentials.api_key;
    if (integrationForm.credentials.username) credentials.username = integrationForm.credentials.username;
    if (integrationForm.credentials.password) credentials.password = integrationForm.credentials.password;

    const payload: any = {
      provider: integrationForm.provider,
      display_name: integrationForm.display_name,
      connection_type: integrationForm.connection_type,
      base_url: integrationForm.base_url || null,
      device_id: integrationForm.device_id || null,
      data_mapping,
      is_active: integrationForm.is_active,
      auto_sync: integrationForm.auto_sync,
    };
    if (Object.keys(credentials).length > 0) {
      payload.credentials = credentials;
    }

    try {
      if (editingIntegration) {
        await api.patch(`/attendance/biometric-integrations/${editingIntegration.integration_id}/`, payload);
        toast.success('Biometric integration updated');
      } else {
        await api.post('/attendance/biometric-integrations/', payload);
        toast.success('Biometric integration created');
      }
      setShowBiometricModal(false);
      resetIntegrationForm();
      fetchBiometricIntegrations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save integration');
    }
  };

  const handleDeleteIntegration = async (integrationId: number) => {
    if (!window.confirm('Delete this biometric integration?')) {
      return;
    }
    try {
      await api.delete(`/attendance/biometric-integrations/${integrationId}/`);
      toast.success('Integration deleted');
      fetchBiometricIntegrations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete integration');
    }
  };

  const handleTestIntegration = async (integration: BiometricIntegration) => {
    try {
      const response = await api.post(`/attendance/biometric-integrations/${integration.integration_id}/test/`);
      toast.success(response?.data?.message || 'Integration tested');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Test failed');
    }
  };

  const handleSyncIntegration = async (integration: BiometricIntegration) => {
    try {
      const response = await api.post(`/attendance/biometric-integrations/${integration.integration_id}/sync/`);
      toast.success(response?.data?.message || 'Sync started');
      fetchBiometricIntegrations();
      fetchBiometricPunches();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Sync failed');
    }
  };

  const handleApproveTimesheet = async (timesheet: Timesheet) => {
    try {
      await api.put(`/attendance/timesheets/${timesheet.timesheet_id}/approve/`);
      toast.success('Timesheet approved');
      fetchTimesheets();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve timesheet');
    }
  };

  const handleRejectTimesheet = async (timesheet: Timesheet) => {
    try {
      await api.put(`/attendance/timesheets/${timesheet.timesheet_id}/reject/`);
      toast.success('Timesheet rejected');
      fetchTimesheets();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject timesheet');
    }
  };

  const handleApproveOvertime = async (request: OvertimeRequest) => {
    try {
      await api.put(`/attendance/overtime-requests/${request.overtime_id}/approve/`);
      toast.success('Overtime approved');
      fetchOvertimeRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve overtime');
    }
  };

  const handleRejectOvertime = async (request: OvertimeRequest) => {
    const notes = window.prompt('Add a rejection note (optional):') || '';
    try {
      await api.put(`/attendance/overtime-requests/${request.overtime_id}/reject/`, { notes });
      toast.success('Overtime rejected');
      fetchOvertimeRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject overtime');
    }
  };

  const getWebhookUrl = (integration: BiometricIntegration) =>
    `${window.location.origin}/api/v1/attendance/biometric-webhook/?token=${integration.webhook_token}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Manage attendance records, shifts, and assignments</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'records' && (
            <button
              onClick={() => {
                resetRecordForm();
                setShowRecordModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Record
            </button>
          )}
          {activeTab === 'shifts' && (
            <button
              onClick={() => {
                resetShiftForm();
                setShowShiftModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Shift
            </button>
          )}
          {activeTab === 'assignments' && (
            <button
              onClick={() => {
                resetAssignmentForm();
                setShowAssignmentModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Assign Shift
            </button>
          )}
          {activeTab === 'biometric' && (
            <button
              onClick={() => {
                resetIntegrationForm();
                setShowBiometricModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Biometric
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'records' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Attendance Records
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'shifts' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Shifts
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Employee Shifts
        </button>
        <button
          onClick={() => setActiveTab('biometric')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'biometric' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Biometric
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

      {activeTab === 'records' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.attendance_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.employee_name || record.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.working_hours ?? '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditRecord(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.attendance_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {attendanceRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Shift</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Timing</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Break</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.shift_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{shift.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {shift.start_time} - {shift.end_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shift.break_duration} mins</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{shift.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditShift(shift)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.shift_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No shifts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Shift</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeeShifts.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {assignment.employee_name || assignment.employee}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.shift_name || assignment.shift}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.start_date} {assignment.end_date ? `- ${assignment.end_date}` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditAssignment(assignment)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employeeShifts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No employee shifts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'biometric' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Integration</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {biometricIntegrations.map((integration) => (
                    <tr key={integration.integration_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{integration.provider}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-900">{integration.display_name}</div>
                        <div className="text-xs text-gray-500 break-all">
                          Webhook: {getWebhookUrl(integration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{integration.connection_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{integration.is_active ? 'Active' : 'Inactive'}</div>
                        {integration.last_sync_message && (
                          <div className="text-xs text-gray-500">{integration.last_sync_message}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => startEditIntegration(integration)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTestIntegration(integration)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => handleSyncIntegration(integration)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Sync
                          </button>
                          <button
                            onClick={() => handleDeleteIntegration(integration.integration_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {biometricIntegrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No biometric integrations configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Biometric Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Direction</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {biometricPunches.map((punch) => (
                    <tr key={punch.punch_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{punch.employee_name || punch.employee_identifier}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{punch.punch_time}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{punch.direction || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{punch.device_id || '-'}</td>
                    </tr>
                  ))}
                  {biometricPunches.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No biometric logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timesheets' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock In</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Clock Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Overtime</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timesheets.map((sheet) => (
                  <tr key={sheet.timesheet_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{sheet.employee_name || sheet.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.clock_in_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.clock_out_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.working_hours ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.overtime_hours ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sheet.source}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sheet.status === 'Open' || sheet.status === 'Submitted' ? (
                          <>
                            <button
                              onClick={() => handleApproveTimesheet(sheet)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTimesheet(sheet)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {timesheets.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                      No timesheets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'overtime' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overtimeRequests.map((request) => (
                  <tr key={request.overtime_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.employee_name || request.employee}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.hours}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.reason || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveOvertime(request)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectOvertime(request)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {overtimeRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No overtime requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}
              </h2>
              <button
                onClick={() => {
                  setShowRecordModal(false);
                  resetRecordForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRecordSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    required
                    value={recordForm.employee}
                    onChange={(event) => setRecordForm({ ...recordForm, employee: event.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={recordForm.date}
                    onChange={(event) => setRecordForm({ ...recordForm, date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock In</label>
                  <input
                    type="time"
                    value={recordForm.clock_in_time}
                    onChange={(event) => setRecordForm({ ...recordForm, clock_in_time: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clock Out</label>
                  <input
                    type="time"
                    value={recordForm.clock_out_time}
                    onChange={(event) => setRecordForm({ ...recordForm, clock_out_time: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={recordForm.working_hours}
                    onChange={(event) => setRecordForm({ ...recordForm, working_hours: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={recordForm.status}
                    onChange={(event) => setRecordForm({ ...recordForm, status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {attendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(event) => setRecordForm({ ...recordForm, notes: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordModal(false);
                    resetRecordForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingRecord ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingShift ? 'Edit Shift' : 'Add Shift'}
              </h2>
              <button
                onClick={() => {
                  setShowShiftModal(false);
                  resetShiftForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleShiftSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Name</label>
                <input
                  type="text"
                  required
                  value={shiftForm.name}
                  onChange={(event) => setShiftForm({ ...shiftForm, name: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.start_time}
                    onChange={(event) => setShiftForm({ ...shiftForm, start_time: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={shiftForm.end_time}
                    onChange={(event) => setShiftForm({ ...shiftForm, end_time: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={shiftForm.break_duration}
                    onChange={(event) => setShiftForm({ ...shiftForm, break_duration: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="shift-active"
                    type="checkbox"
                    checked={shiftForm.is_active}
                    onChange={(event) => setShiftForm({ ...shiftForm, is_active: event.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="shift-active" className="text-sm text-gray-700">
                    Active shift
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={shiftForm.description}
                  onChange={(event) => setShiftForm({ ...shiftForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShiftModal(false);
                    resetShiftForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingShift ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Assign Shift'}
              </h2>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  resetAssignmentForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={assignmentForm.employee}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, employee: event.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  required
                  value={assignmentForm.shift}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, shift: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.shift_id} value={shift.shift_id}>
                      {shift.name}
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
                    value={assignmentForm.start_date}
                    onChange={(event) => setAssignmentForm({ ...assignmentForm, start_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={assignmentForm.end_date}
                    onChange={(event) => setAssignmentForm({ ...assignmentForm, end_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="assignment-active"
                  type="checkbox"
                  checked={assignmentForm.is_active}
                  onChange={(event) => setAssignmentForm({ ...assignmentForm, is_active: event.target.checked })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="assignment-active" className="text-sm text-gray-700">
                  Active assignment
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    resetAssignmentForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBiometricModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingIntegration ? 'Edit Biometric Integration' : 'Add Biometric Integration'}
              </h2>
              <button
                onClick={() => {
                  setShowBiometricModal(false);
                  resetIntegrationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleIntegrationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    value={integrationForm.provider}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        provider: event.target.value as BiometricIntegration['provider'],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {biometricProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={integrationForm.display_name}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, display_name: event.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connection Type</label>
                  <select
                    value={integrationForm.connection_type}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        connection_type: event.target.value as BiometricIntegration['connection_type'],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {biometricConnectionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
                  <input
                    type="text"
                    value={integrationForm.base_url}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, base_url: event.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
                  <input
                    type="text"
                    value={integrationForm.device_id}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, device_id: event.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Field Mapping</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Employee ID field (e.g. employee_id)"
                    value={integrationForm.employee_identifier_field}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        employee_identifier_field: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={integrationForm.employee_identifier_type}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        employee_identifier_type: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="employee_id">Employee ID</option>
                    <option value="email">Email</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Timestamp field (e.g. timestamp)"
                    value={integrationForm.timestamp_field}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        timestamp_field: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Direction field (e.g. direction)"
                    value={integrationForm.direction_field}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        direction_field: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Credentials</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="API Key"
                    value={integrationForm.credentials.api_key}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, api_key: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={integrationForm.credentials.username}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, username: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={integrationForm.credentials.password}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, password: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={integrationForm.is_active}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, is_active: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={integrationForm.auto_sync}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, auto_sync: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Auto Sync
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBiometricModal(false);
                    resetIntegrationForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingIntegration ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
