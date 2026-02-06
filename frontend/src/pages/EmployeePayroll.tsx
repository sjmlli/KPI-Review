import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Payroll, ExpenseClaim } from '../types';

type EmployeePayrollTab = 'payslips' | 'claims';

const claimCategories: ExpenseClaim['category'][] = ['Travel', 'Meal', 'Office', 'Training', 'Other'];

const EmployeePayroll: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EmployeePayrollTab>('payslips');
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimForm, setClaimForm] = useState({
    category: 'Other' as ExpenseClaim['category'],
    amount: '',
    currency: 'INR',
    expense_date: '',
    description: '',
    notes: '',
    receipt: null as File | null,
  });

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/payrolls/');
      setPayrolls(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch payslips');
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPayrolls(), fetchClaims()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  const handleClaimSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('category', claimForm.category);
    formData.append('amount', claimForm.amount);
    formData.append('currency', claimForm.currency);
    formData.append('expense_date', claimForm.expense_date);
    if (claimForm.description) formData.append('description', claimForm.description);
    if (claimForm.notes) formData.append('notes', claimForm.notes);
    if (claimForm.receipt) formData.append('receipt', claimForm.receipt);

    try {
      await api.post('/payroll/claims/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Claim submitted');
      setClaimForm({
        category: 'Other',
        amount: '',
        currency: 'INR',
        expense_date: '',
        description: '',
        notes: '',
        receipt: null,
      });
      fetchClaims();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit claim');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading payroll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
        <p className="text-gray-600 mt-1">View payslips and submit reimbursement claims</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('payslips')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'payslips' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Payslips
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

      {activeTab === 'payslips' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net Pay</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll.payroll_id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payroll.pay_period_start} - {payroll.pay_period_end}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payroll.net_pay}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payroll.status}</td>
                    <td className="px-6 py-4">
                      {payroll.payslip_file ? (
                        <button
                          onClick={() => handleDownloadPayslip(payroll)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Download
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Not generated</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No payslips available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Claim</h2>
            <form onSubmit={handleClaimSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={claimForm.category}
                  onChange={(event) =>
                    setClaimForm({ ...claimForm, category: event.target.value as ExpenseClaim['category'] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {claimCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={claimForm.amount}
                  onChange={(event) => setClaimForm({ ...claimForm, amount: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <input
                  type="text"
                  value={claimForm.currency}
                  onChange={(event) => setClaimForm({ ...claimForm, currency: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Date</label>
                <input
                  type="date"
                  required
                  value={claimForm.expense_date}
                  onChange={(event) => setClaimForm({ ...claimForm, expense_date: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={claimForm.description}
                  onChange={(event) => setClaimForm({ ...claimForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={claimForm.notes}
                  onChange={(event) => setClaimForm({ ...claimForm, notes: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                <input
                  type="file"
                  onChange={(event) =>
                    setClaimForm({ ...claimForm, receipt: event.target.files?.[0] || null })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Submit Claim
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.claim_id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{claim.expense_date}</td>
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
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No claims submitted.
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

export default EmployeePayroll;
