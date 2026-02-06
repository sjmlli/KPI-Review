import { useEffect, useState } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';
import type { Employee, Department, OfferLetter, Role } from '../types';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [offerLetters, setOfferLetters] = useState<OfferLetter[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [offerEmployee, setOfferEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ loginId: string; password: string } | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    designation: '',
    role: 'Employee',
    managers: [] as string[],
    team_lead: '',
    salary: '',
    date_of_birth: '',
    hire_date: '',
    status: 'Active',
    address: '',
    password: '',
  });

  const [deptFormData, setDeptFormData] = useState({
    name: '',
    description: '',
  });

  const [offerForm, setOfferForm] = useState({
    joining_date: '',
    ctc: '',
    designation: '',
    probation_period: '',
    reporting_manager: '',
    work_location: '',
    benefits: '',
    shift_timings: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchOfferLetters();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await api.get('/employees/');
      console.log('Employees response:', response.data);
      const employeeData = response.data.results || response.data || [];
      console.log('Employee data:', employeeData);
      setEmployees(employeeData);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to fetch employees: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await api.get('/employees/departments/');
      console.log('Departments response:', response.data);
      setDepartments(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to fetch departments: ' + (error.message || 'Unknown error'));
    }
  };

  const fetchOfferLetters = async () => {
    try {
      const response = await api.get('/employees/offer-letters/');
      setOfferLetters(response.data.results || response.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch offer letters');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/employees/roles/');
      setRoles(response.data.results || response.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch roles');
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await api.put(`/employees/departments/${editingDepartment.department_id}/`, deptFormData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/employees/departments/', deptFormData);
        toast.success('Department created successfully');
      }
      setShowDeptModal(false);
      resetDeptForm();
      fetchDepartments();
    } catch (error: any) {
      console.error('Error saving department:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data 
        ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
        : 'Failed to save department';
      toast.error(errorMsg);
    }
  };

  const handleDeleteDept = async (departmentId: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/employees/departments/${departmentId}/`);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error: any) {
        console.error('Error deleting department:', error);
        const errorMsg = error.response?.data?.detail || 'Failed to delete department';
        toast.error(errorMsg);
      }
    }
  };

  const handleEditDept = (dept: Department) => {
    setEditingDepartment(dept);
    setDeptFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setShowDeptModal(true);
  };

  console.log('Editing department:', editingDepartment);

  const resetDeptForm = () => {
    setDeptFormData({
      name: '',
      description: '',
    });
    setEditingDepartment(null);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 12; i += 1) {
      generated += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, password: generated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the data
      const submitData = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        department: formData.department ? parseInt(formData.department) : null,
        team_lead: formData.team_lead ? parseInt(formData.team_lead) : null,
        managers: formData.managers.map((managerId) => parseInt(managerId, 10)),
      };

      if (editingEmployee) {
        const { password, ...updateData } = submitData;
        await api.put(`/employees/${editingEmployee.employee_id}/`, updateData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees/', submitData);
        toast.success('Employee added successfully');
        setCreatedCredentials({ loginId: submitData.email, password: submitData.password });
        setShowCredentialsModal(true);
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      const errorMessage = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2)
        : 'Failed to save employee';
      
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  const handleDelete = async (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${employeeId}/`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number || '',
      department: employee.department ? employee.department.toString() : '',
      designation: employee.designation,
      role: employee.role || 'Employee',
      managers: (employee.managers || []).map((managerId) => managerId.toString()),
      team_lead: employee.team_lead ? employee.team_lead.toString() : '',
      salary: employee.salary !== undefined ? employee.salary.toString() : '',
      date_of_birth: employee.date_of_birth || '',
      hire_date: employee.hire_date,
      status: employee.status,
      address: employee.address || '',
      password: '',
    });
    setShowModal(true);
  };

  const startOfferLetter = (employee: Employee) => {
    setOfferEmployee(employee);
    setOfferForm({
      joining_date: employee.hire_date || '',
      ctc: employee.salary?.toString() || '',
      designation: employee.designation || '',
      probation_period: '',
      reporting_manager: '',
      work_location: '',
      benefits: '',
      shift_timings: '',
    });
    setShowOfferModal(true);
  };

  const handleOfferLetterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!offerEmployee) {
      return;
    }
    const payload = {
      employee: offerEmployee.employee_id,
      joining_date: offerForm.joining_date,
      ctc: parseFloat(offerForm.ctc),
      designation: offerForm.designation,
      probation_period: offerForm.probation_period,
      reporting_manager: offerForm.reporting_manager ? parseInt(offerForm.reporting_manager, 10) : null,
      work_location: offerForm.work_location,
      benefits: offerForm.benefits || null,
      shift_timings: offerForm.shift_timings || null,
    };

    try {
      await api.post('/employees/offer-letters/', payload);
      toast.success('Offer letter generated');
      setShowOfferModal(false);
      setOfferEmployee(null);
      fetchOfferLetters();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate offer letter');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      department: '',
      designation: '',
      role: 'Employee',
      managers: [],
      team_lead: '',
      salary: '',
      date_of_birth: '',
      hire_date: '',
      status: 'Active',
      address: '',
      password: '',
    });
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.designation}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const offerLetterByEmployee = offerLetters.reduce((acc, letter) => {
    const existing = acc.get(letter.employee);
    if (!existing) {
      acc.set(letter.employee, letter);
      return acc;
    }
    const existingDate = existing.issued_at ? Date.parse(existing.issued_at) : 0;
    const newDate = letter.issued_at ? Date.parse(letter.issued_at) : 0;
    if (newDate >= existingDate) {
      acc.set(letter.employee, letter);
    }
    return acc;
  }, new Map<number, OfferLetter>());

  const getOfferLetterUrl = (fileUrl?: string | null) => {
    if (!fileUrl) {
      return '#';
    }
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    if (fileUrl.startsWith('/')) {
      return `${window.location.origin}${fileUrl}`;
    }
    return `${window.location.origin}/${fileUrl}`;
  };

  const roleNames = new Set(roles.map((role) => role.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering employees page, count:', employees.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetDeptForm();
              setShowDeptModal(true);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Manage Departments
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search employees by name, email, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {employee.first_name?.[0] || ''}{employee.last_name?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-500">ID: {employee.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{employee.email}</p>
                    <p className="text-sm text-gray-500">{employee.phone_number || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{employee.designation}</p>
                    <p className="text-sm text-gray-500">{employee.department_name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : employee.status === 'On Leave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startOfferLetter(employee)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Generate Offer Letter"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      {offerLetterByEmployee.get(employee.employee_id)?.pdf_file && (
                        <a
                          href={getOfferLetterUrl(offerLetterByEmployee.get(employee.employee_id)?.pdf_file)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download Offer Letter"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(employee.employee_id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {!editingEmployee && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Login Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Login ID</label>
                      <input
                        type="text"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Login ID uses the employee email.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required={!editingEmployee}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Software Engineer, HR Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {!roleNames.has(formData.role) && (
                      <option value={formData.role}>{formData.role}</option>
                    )}
                    {roles.length === 0 && <option value="Employee">Employee</option>}
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Reporting Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Managers</label>
                    <select
                      multiple
                      value={formData.managers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          managers: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
                    >
                      {employees
                        .filter((manager) => manager.employee_id !== editingEmployee?.employee_id)
                        .map((manager) => (
                          <option key={manager.employee_id} value={manager.employee_id}>
                            {manager.full_name || `${manager.first_name} ${manager.last_name}`}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple managers.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Lead (optional)</label>
                    <select
                      value={formData.team_lead}
                      onChange={(e) => setFormData({ ...formData, team_lead: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select team lead</option>
                      {employees
                        .filter((lead) => lead.employee_id !== editingEmployee?.employee_id)
                        .map((lead) => (
                          <option key={lead.employee_id} value={lead.employee_id}>
                            {lead.full_name || `${lead.first_name} ${lead.last_name}`}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="50000.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Manage Departments</h2>
              <button
                onClick={() => {
                  setShowDeptModal(false);
                  resetDeptForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Add/Edit Department Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
                <form onSubmit={handleDeptSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={deptFormData.name}
                        onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Engineering, HR, Sales"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={deptFormData.description}
                        onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    {editingDepartment && (
                      <button
                        type="button"
                        onClick={resetDeptForm}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingDepartment ? 'Update' : 'Add'} Department
                    </button>
                  </div>
                </form>
              </div>

              {/* Departments List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Departments</h3>
                {departments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500">No departments yet. Add your first department above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map((dept) => (
                      <div
                        key={dept.department_id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">{dept.name}</h4>
                            {dept.description && (
                              <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditDept(dept)}
                              className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDept(dept.department_id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOfferModal && offerEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Generate Offer Letter - {offerEmployee.first_name} {offerEmployee.last_name}
              </h2>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferEmployee(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleOfferLetterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerForm.joining_date}
                    onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTC</label>
                  <input
                    type="number"
                    required
                    value={offerForm.ctc}
                    onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    required
                    value={offerForm.designation}
                    onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Probation Period</label>
                  <input
                    type="text"
                    required
                    value={offerForm.probation_period}
                    onChange={(e) => setOfferForm({ ...offerForm, probation_period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. 3 months"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Manager</label>
                  <select
                    value={offerForm.reporting_manager}
                    onChange={(e) => setOfferForm({ ...offerForm, reporting_manager: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select manager</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                  <input
                    type="text"
                    required
                    value={offerForm.work_location}
                    onChange={(e) => setOfferForm({ ...offerForm, work_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <textarea
                    value={offerForm.benefits}
                    onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Timings</label>
                  <input
                    type="text"
                    value={offerForm.shift_timings}
                    onChange={(e) => setOfferForm({ ...offerForm, shift_timings: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOfferModal(false);
                    setOfferEmployee(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Generate PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCredentialsModal && createdCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Employee Login Details</h2>
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCreatedCredentials(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Login ID</p>
                <p className="text-lg font-semibold text-gray-900">{createdCredentials.loginId}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Temporary Password</p>
                <p className="text-lg font-semibold text-gray-900">{createdCredentials.password}</p>
              </div>
              <p className="text-xs text-gray-500">
                Share these credentials securely with the employee and ask them to change the password after first login.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setCreatedCredentials(null);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
