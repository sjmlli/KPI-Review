import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Employee, Payroll, SalaryStructure, ExpenseClaim } from '../types';

type PayrollTab = 'payrolls' | 'structures' | 'claims';

const payrollStatuses = ['Pending', 'Paid', 'Unpaid'];

const PayrollPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PayrollTab>('payrolls');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);

  const [payrollForm, setPayrollForm] = useState({
    employee: '',
    pay_period_start: '',
    pay_period_end: '',
    basic_salary: '',
    allowances: '',
    bonus: '',
    overtime_pay: '',
    deductions: '',
    tax: '',
    insurance: '',
    status: 'Pending',
    payment_date: '',
    notes: '',
  });

  const [structureForm, setStructureForm] = useState({
    employee: '',
    basic_salary: '',
    house_rent_allowance: '',
    transport_allowance: '',
    medical_allowance: '',
    other_allowances: '',
    provident_fund_percentage: '',
    tax_percentage: '',
    effective_from: '',
    effective_to: '',
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchEmployees(), fetchPayrolls(), fetchStructures(), fetchClaims()]);
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

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/payrolls/');
      setPayrolls(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch payrolls');
    }
  };

  const fetchStructures = async () => {
    try {
      const response = await api.get('/payroll/salary-structures/');
      setStructures(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch salary structures');
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await api.get('/payroll/claims/');
      setClaims(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch claims');
    }
  };

  const resetPayrollForm = () => {
    setPayrollForm({
      employee: '',
      pay_period_start: '',
      pay_period_end: '',
      basic_salary: '',
      allowances: '',
      bonus: '',
      overtime_pay: '',
      deductions: '',
      tax: '',
      insurance: '',
      status: 'Pending',
      payment_date: '',
      notes: '',
    });
    setEditingPayroll(null);
  };

  const resetStructureForm = () => {
    setStructureForm({
      employee: '',
      basic_salary: '',
      house_rent_allowance: '',
      transport_allowance: '',
      medical_allowance: '',
      other_allowances: '',
      provident_fund_percentage: '',
      tax_percentage: '',
      effective_from: '',
      effective_to: '',
      is_active: true,
    });
    setEditingStructure(null);
  };

  const handlePayrollSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const basePayload = {
      employee: parseInt(payrollForm.employee, 10),
      pay_period_start: payrollForm.pay_period_start,
      pay_period_end: payrollForm.pay_period_end,
      basic_salary: parseFloat(payrollForm.basic_salary),
      allowances: parseFloat(payrollForm.allowances || '0'),
      bonus: parseFloat(payrollForm.bonus || '0'),
      overtime_pay: parseFloat(payrollForm.overtime_pay || '0'),
      deductions: parseFloat(payrollForm.deductions || '0'),
      tax: parseFloat(payrollForm.tax || '0'),
      insurance: parseFloat(payrollForm.insurance || '0'),
      notes: payrollForm.notes || null,
    };

    try {
      if (editingPayroll) {
        await api.patch(`/payroll/payrolls/${editingPayroll.payroll_id}/`, {
          ...basePayload,
          status: payrollForm.status,
          payment_date: payrollForm.payment_date || null,
        });
        toast.success('Payroll updated');
      } else {
        await api.post('/payroll/payrolls/', basePayload);
        toast.success('Payroll created');
      }
      setShowPayrollModal(false);
      resetPayrollForm();
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payroll');
    }
  };

  const handleStructureSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      employee: parseInt(structureForm.employee, 10),
      basic_salary: parseFloat(structureForm.basic_salary),
      house_rent_allowance: parseFloat(structureForm.house_rent_allowance || '0'),
      transport_allowance: parseFloat(structureForm.transport_allowance || '0'),
      medical_allowance: parseFloat(structureForm.medical_allowance || '0'),
      other_allowances: parseFloat(structureForm.other_allowances || '0'),
      provident_fund_percentage: parseFloat(structureForm.provident_fund_percentage || '0'),
      tax_percentage: parseFloat(structureForm.tax_percentage || '0'),
      effective_from: structureForm.effective_from,
      effective_to: structureForm.effective_to || null,
      is_active: structureForm.is_active,
    };

    try {
      if (editingStructure) {
        await api.patch(`/payroll/salary-structures/${editingStructure.structure_id}/`, payload);
        toast.success('Salary structure updated');
      } else {
        await api.post('/payroll/salary-structures/', payload);
        toast.success('Salary structure created');
      }
      setShowStructureModal(false);
      resetStructureForm();
      fetchStructures();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save salary structure');
    }
  };

  const handleDeletePayroll = async (payrollId: number) => {
    if (!window.confirm('Delete this payroll record?')) {
      return;
    }
    try {
      await api.delete(`/payroll/payrolls/${payrollId}/`);
      toast.success('Payroll deleted');
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete payroll');
    }
  };

  const handleDeleteStructure = async (structureId: number) => {
    if (!window.confirm('Delete this salary structure?')) {
      return;
    }
    try {
      await api.delete(`/payroll/salary-structures/${structureId}/`);
      toast.success('Salary structure deleted');
      fetchStructures();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete salary structure');
    }
  };

  const handleGeneratePayslip = async (payroll: Payroll) => {
    try {
      await api.post(`/payroll/payrolls/${payroll.payroll_id}/generate_payslip/`);
      toast.success('Payslip generated');
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate payslip');
    }
  };

  const handleDownloadPayslip = async (payroll: Payroll) => {
    try {
      const response = await api.get(`/payroll/payrolls/${payroll.payroll_id}/download_payslip/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip_${payroll.pay_period_start}_${payroll.pay_period_end}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download payslip');
    }
  };

  const handleApproveClaim = async (claim: ExpenseClaim) => {
    try {
      await api.put(`/payroll/claims/${claim.claim_id}/approve/`);
      toast.success('Claim approved');
      fetchClaims();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claim: ExpenseClaim) => {
    const rejection_reason = window.prompt('Add a rejection reason (optional):') || '';
    try {
      await api.put(`/payroll/claims/${claim.claim_id}/reject/`, { rejection_reason });
      toast.success('Claim rejected');
      fetchClaims();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject claim');
    }
  };

  const startEditPayroll = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setPayrollForm({
      employee: payroll.employee.toString(),
      pay_period_start: payroll.pay_period_start,
      pay_period_end: payroll.pay_period_end,
      basic_salary: payroll.basic_salary.toString(),
      allowances: payroll.allowances.toString(),
      bonus: payroll.bonus.toString(),
      overtime_pay: payroll.overtime_pay.toString(),
      deductions: payroll.deductions.toString(),
      tax: payroll.tax.toString(),
      insurance: payroll.insurance.toString(),
      status: payroll.status,
      payment_date: payroll.payment_date || '',
      notes: payroll.notes || '',
    });
    setShowPayrollModal(true);
  };

  const startEditStructure = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setStructureForm({
      employee: structure.employee.toString(),
      basic_salary: structure.basic_salary.toString(),
      house_rent_allowance: structure.house_rent_allowance.toString(),
      transport_allowance: structure.transport_allowance.toString(),
      medical_allowance: structure.medical_allowance.toString(),
      other_allowances: structure.other_allowances.toString(),
      provident_fund_percentage: structure.provident_fund_percentage.toString(),
      tax_percentage: structure.tax_percentage.toString(),
      effective_from: structure.effective_from,
      effective_to: structure.effective_to || '',
      is_active: structure.is_active,
    });
    setShowStructureModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage payroll records and salary structures</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'payrolls' && (
            <button
              onClick={() => {
                resetPayrollForm();
                setShowPayrollModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Payroll
            </button>
          )}
          {activeTab === 'structures' && (
            <button
              onClick={() => {
                resetStructureForm();
                setShowStructureModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Structure
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('payrolls')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'payrolls' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Payroll Records
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'structures' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Salary Structures
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'claims' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Claims
        </button>
      </div>

      {activeTab === 'payrolls' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net Pay</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll.payroll_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{payroll.employee_name || payroll.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payroll.pay_period_start} - {payroll.pay_period_end}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payroll.net_pay}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payroll.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditPayroll(payroll)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        {payroll.payslip_file ? (
                          <button
                            onClick={() => handleDownloadPayslip(payroll)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Download
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGeneratePayslip(payroll)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Generate Payslip
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayroll(payroll.payroll_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Basic Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Effective</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {structures.map((structure) => (
                  <tr key={structure.structure_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{structure.employee_name || structure.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{structure.basic_salary}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{structure.effective_from}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {structure.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditStructure(structure)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStructure(structure.structure_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {structures.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No salary structures found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Receipt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{claim.employee_name || claim.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{claim.expense_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{claim.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {claim.amount} {claim.currency}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{claim.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {claim.receipt ? (
                        <a
                          href={claim.receipt}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {claim.status === 'Submitted' ? (
                          <>
                            <button
                              onClick={() => handleApproveClaim(claim)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClaim(claim)}
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
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPayrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPayroll ? 'Edit Payroll' : 'Add Payroll'}
              </h2>
              <button
                onClick={() => {
                  setShowPayrollModal(false);
                  resetPayrollForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePayrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={payrollForm.employee}
                  onChange={(event) => setPayrollForm({ ...payrollForm, employee: event.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period Start</label>
                  <input
                    type="date"
                    required
                    value={payrollForm.pay_period_start}
                    onChange={(event) => setPayrollForm({ ...payrollForm, pay_period_start: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period End</label>
                  <input
                    type="date"
                    required
                    value={payrollForm.pay_period_end}
                    onChange={(event) => setPayrollForm({ ...payrollForm, pay_period_end: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={payrollForm.basic_salary}
                    onChange={(event) => setPayrollForm({ ...payrollForm, basic_salary: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowances</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.allowances}
                    onChange={(event) => setPayrollForm({ ...payrollForm, allowances: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bonus</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.bonus}
                    onChange={(event) => setPayrollForm({ ...payrollForm, bonus: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Pay</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.overtime_pay}
                    onChange={(event) => setPayrollForm({ ...payrollForm, overtime_pay: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deductions</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.deductions}
                    onChange={(event) => setPayrollForm({ ...payrollForm, deductions: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.tax}
                    onChange={(event) => setPayrollForm({ ...payrollForm, tax: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.insurance}
                    onChange={(event) => setPayrollForm({ ...payrollForm, insurance: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={payrollForm.status}
                    onChange={(event) => setPayrollForm({ ...payrollForm, status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {payrollStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                  <input
                    type="date"
                    value={payrollForm.payment_date}
                    onChange={(event) => setPayrollForm({ ...payrollForm, payment_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={payrollForm.notes}
                  onChange={(event) => setPayrollForm({ ...payrollForm, notes: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayrollModal(false);
                    resetPayrollForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingPayroll ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStructureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
              </h2>
              <button
                onClick={() => {
                  setShowStructureModal(false);
                  resetStructureForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleStructureSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  required
                  value={structureForm.employee}
                  onChange={(event) => setStructureForm({ ...structureForm, employee: event.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={structureForm.basic_salary}
                    onChange={(event) => setStructureForm({ ...structureForm, basic_salary: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">House Rent Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.house_rent_allowance}
                    onChange={(event) => setStructureForm({ ...structureForm, house_rent_allowance: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.transport_allowance}
                    onChange={(event) => setStructureForm({ ...structureForm, transport_allowance: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.medical_allowance}
                    onChange={(event) => setStructureForm({ ...structureForm, medical_allowance: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other Allowances</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.other_allowances}
                    onChange={(event) => setStructureForm({ ...structureForm, other_allowances: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provident Fund %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.provident_fund_percentage}
                    onChange={(event) => setStructureForm({ ...structureForm, provident_fund_percentage: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={structureForm.tax_percentage}
                    onChange={(event) => setStructureForm({ ...structureForm, tax_percentage: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="structure-active"
                    type="checkbox"
                    checked={structureForm.is_active}
                    onChange={(event) => setStructureForm({ ...structureForm, is_active: event.target.checked })}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="structure-active" className="text-sm text-gray-700">
                    Active structure
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective From</label>
                  <input
                    type="date"
                    required
                    value={structureForm.effective_from}
                    onChange={(event) => setStructureForm({ ...structureForm, effective_from: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective To</label>
                  <input
                    type="date"
                    value={structureForm.effective_to}
                    onChange={(event) => setStructureForm({ ...structureForm, effective_to: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowStructureModal(false);
                    resetStructureForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingStructure ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
