import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import type { Department, EvaluationPeriod, KPI } from '../types';

type Tab = 'kpis' | 'periods';

const badgeClasses = (value: string) => {
  const v = value.toLowerCase();
  if (v === 'active') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (v === 'draft') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (v === 'closed') return 'bg-gray-100 text-gray-800 border-gray-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const categoryLabel = (cat: KPI['category']) => {
  switch (cat) {
    case 'GENERAL':
      return 'General';
    case 'JOB_SPECIFIC':
      return 'Job Specific';
    case 'STRATEGIC':
      return 'Strategic';
    default:
      return cat;
  }
};

const periodTypeLabel = (t: EvaluationPeriod['period_type']) => {
  switch (t) {
    case 'MONTHLY':
      return 'Monthly';
    case 'QUARTERLY':
      return 'Quarterly';
    case 'ANNUAL':
      return 'Annual';
    default:
      return t;
  }
};

const Performance = () => {
  const { employeeProfile } = useAuth();
  const isHR = useMemo(() => {
    const role = (employeeProfile?.role || '').toLowerCase();
    return role === 'hr' || role === 'admin';
  }, [employeeProfile?.role]);

  const [tab, setTab] = useState<Tab>('kpis');

  // Shared data
  const [departments, setDepartments] = useState<Department[]>([]);

  // KPI state
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [kpiSaving, setKpiSaving] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [kpiForm, setKpiForm] = useState({
    title: '',
    category: 'GENERAL' as KPI['category'],
    weight: 1,
    description: '',
    is_active: true,
    related_department: '' as '' | number,
    related_role: '',
  });

  // Period state
  const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [periodSaving, setPeriodSaving] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<EvaluationPeriod | null>(null);
  const [periodForm, setPeriodForm] = useState({
    name: '',
    period_type: 'MONTHLY' as EvaluationPeriod['period_type'],
    start_date: '',
    end_date: '',
    status: 'DRAFT' as EvaluationPeriod['status'],
  });

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/employees/departments/');
      const data = (res.data?.results ?? res.data) as Department[];
      setDepartments(data);
    } catch {
      // Non-blocking
    }
  };

  const fetchKpis = async () => {
    setKpiLoading(true);
    try {
      const res = await api.get('/performance/kpis/');
      const data = (res.data?.results ?? res.data) as KPI[];
      setKpis(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load KPIs');
    } finally {
      setKpiLoading(false);
    }
  };

  const fetchPeriods = async () => {
    setPeriodLoading(true);
    try {
      const res = await api.get('/performance/periods/');
      const data = (res.data?.results ?? res.data) as EvaluationPeriod[];
      setPeriods(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load periods');
    } finally {
      setPeriodLoading(false);
    }
  };

  useEffect(() => {
    if (!isHR) return;
    fetchDepartments();
    fetchKpis();
    fetchPeriods();
  }, [isHR]);

  // KPI actions
  const openCreateKpi = () => {
    setEditingKpi(null);
    setKpiForm({
      title: '',
      category: 'GENERAL',
      weight: 1,
      description: '',
      is_active: true,
      related_department: '',
      related_role: '',
    });
    setKpiModalOpen(true);
  };

  const openEditKpi = (kpi: KPI) => {
    setEditingKpi(kpi);
    setKpiForm({
      title: kpi.title,
      category: kpi.category,
      weight: Number(kpi.weight),
      description: kpi.description || '',
      is_active: kpi.is_active,
      related_department: (kpi.related_department ?? '') as any,
      related_role: kpi.related_role || '',
    });
    setKpiModalOpen(true);
  };

  const saveKpi = async () => {
    setKpiSaving(true);
    try {
      const payload = {
        title: kpiForm.title.trim(),
        category: kpiForm.category,
        weight: Number(kpiForm.weight),
        description: kpiForm.description.trim() || null,
        is_active: kpiForm.is_active,
        related_department: kpiForm.related_department === '' ? null : kpiForm.related_department,
        related_role: kpiForm.related_role.trim() || null,
      };

      if (editingKpi) {
        await api.put(`/performance/kpis/${editingKpi.kpi_id}/`, payload);
        toast.success('KPI updated');
      } else {
        await api.post('/performance/kpis/', payload);
        toast.success('KPI created');
      }
      setKpiModalOpen(false);
      await fetchKpis();
    } catch (err: any) {
      const detail = err?.response?.data;
      toast.error(detail?.detail || 'Failed to save KPI');
    } finally {
      setKpiSaving(false);
    }
  };

  const toggleKpiActive = async (kpi: KPI) => {
    try {
      await api.patch(`/performance/kpis/${kpi.kpi_id}/`, { is_active: !kpi.is_active });
      toast.success(kpi.is_active ? 'KPI deactivated' : 'KPI activated');
      await fetchKpis();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update KPI');
    }
  };

  // Period actions
  const openCreatePeriod = () => {
    setEditingPeriod(null);
    setPeriodForm({
      name: '',
      period_type: 'MONTHLY',
      start_date: '',
      end_date: '',
      status: 'DRAFT',
    });
    setPeriodModalOpen(true);
  };

  const openEditPeriod = (period: EvaluationPeriod) => {
    setEditingPeriod(period);
    setPeriodForm({
      name: period.name,
      period_type: period.period_type,
      start_date: period.start_date,
      end_date: period.end_date,
      status: period.status,
    });
    setPeriodModalOpen(true);
  };

  const savePeriod = async () => {
    setPeriodSaving(true);
    try {
      const payload = {
        name: periodForm.name.trim(),
        period_type: periodForm.period_type,
        start_date: periodForm.start_date,
        end_date: periodForm.end_date,
        status: periodForm.status,
      };

      if (editingPeriod) {
        await api.put(`/performance/periods/${editingPeriod.period_id}/`, payload);
        toast.success('Period updated');
      } else {
        await api.post('/performance/periods/', payload);
        toast.success('Period created');
      }
      setPeriodModalOpen(false);
      await fetchPeriods();
    } catch (err: any) {
      const detail = err?.response?.data;
      toast.error(detail?.detail || 'Failed to save period');
    } finally {
      setPeriodSaving(false);
    }
  };

  const activatePeriod = async (period: EvaluationPeriod) => {
    try {
      await api.post(`/performance/periods/${period.period_id}/activate/`);
      toast.success('Period activated');
      await fetchPeriods();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to activate period');
    }
  };

  const closePeriod = async (period: EvaluationPeriod) => {
    try {
      await api.post(`/performance/periods/${period.period_id}/close/`);
      toast.success('Period closed');
      await fetchPeriods();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to close period');
    }
  };

  if (!isHR) {
    return (
      <div className="app-panel rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-2">Performance Management</h3>
        <p className="text-gray-600">You don’t have access to this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Performance Management</h3>
            <p className="text-gray-600 mt-1">Configure KPIs and evaluation periods.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('kpis')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                tab === 'kpis'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              KPIs
            </button>
            <button
              onClick={() => setTab('periods')}
              className={`px-4 py-2 rounded-xl border transition-all ${
                tab === 'periods'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Periods
            </button>
          </div>
        </div>
      </div>

      {tab === 'kpis' && (
        <div className="app-panel rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xl font-semibold">KPI Management</h4>
              <p className="text-gray-600 text-sm">Create and manage weighted KPIs (general/job-specific/strategic).</p>
            </div>
            <button
              onClick={openCreateKpi}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + New KPI
            </button>
          </div>

          {kpiLoading ? (
            <div className="text-gray-600">Loading KPIs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Weight</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Department</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((kpi) => (
                    <tr key={kpi.kpi_id} className="border-b border-gray-100">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{kpi.title}</div>
                        {kpi.description && <div className="text-gray-500 text-xs mt-1 line-clamp-1">{kpi.description}</div>}
                      </td>
                      <td className="py-3 pr-4">{categoryLabel(kpi.category)}</td>
                      <td className="py-3 pr-4">{kpi.weight}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${
                            kpi.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {kpi.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {departments.find((d) => d.department_id === kpi.related_department)?.name || '—'}
                      </td>
                      <td className="py-3 pr-4">{kpi.related_role || '—'}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditKpi(kpi)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleKpiActive(kpi)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            {kpi.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {kpis.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No KPIs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'periods' && (
        <div className="app-panel rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xl font-semibold">Evaluation Periods</h4>
              <p className="text-gray-600 text-sm">Create monthly/quarterly/annual periods and control their lifecycle.</p>
            </div>
            <button
              onClick={openCreatePeriod}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + New Period
            </button>
          </div>

          {periodLoading ? (
            <div className="text-gray-600">Loading periods...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Start</th>
                    <th className="py-3 pr-4">End</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => (
                    <tr key={p.period_id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4">{periodTypeLabel(p.period_type)}</td>
                      <td className="py-3 pr-4">{p.start_date}</td>
                      <td className="py-3 pr-4">{p.end_date}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${badgeClasses(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditPeriod(p)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => activatePeriod(p)}
                            disabled={p.status === 'ACTIVE'}
                            className={`px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => closePeriod(p)}
                            disabled={p.status === 'CLOSED'}
                            className={`px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {periods.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No periods yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KPI Modal */}
      {kpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setKpiModalOpen(false)} />
          <div className="relative w-full max-w-xl app-panel rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold">{editingKpi ? 'Edit KPI' : 'Create KPI'}</h4>
                <p className="text-gray-600 text-sm">Define title, category and weight.</p>
              </div>
              <button onClick={() => setKpiModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-50">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  value={kpiForm.title}
                  onChange={(e) => setKpiForm((s) => ({ ...s, title: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  placeholder="e.g., Quality of Work"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Category</label>
                <select
                  value={kpiForm.category}
                  onChange={(e) => setKpiForm((s) => ({ ...s, category: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="GENERAL">General</option>
                  <option value="JOB_SPECIFIC">Job Specific</option>
                  <option value="STRATEGIC">Strategic</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={kpiForm.weight}
                  onChange={(e) => setKpiForm((s) => ({ ...s, weight: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Related Department (optional)</label>
                <select
                  value={kpiForm.related_department}
                  onChange={(e) => setKpiForm((s) => ({ ...s, related_department: e.target.value ? Number(e.target.value) : '' }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="">—</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Related Role (optional)</label>
                <input
                  value={kpiForm.related_role}
                  onChange={(e) => setKpiForm((s) => ({ ...s, related_role: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  placeholder="e.g., Sales"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Description (optional)</label>
                <textarea
                  value={kpiForm.description}
                  onChange={(e) => setKpiForm((s) => ({ ...s, description: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="kpi-active"
                  type="checkbox"
                  checked={kpiForm.is_active}
                  onChange={(e) => setKpiForm((s) => ({ ...s, is_active: e.target.checked }))}
                />
                <label htmlFor="kpi-active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setKpiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveKpi}
                disabled={kpiSaving || !kpiForm.title.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {kpiSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Period Modal */}
      {periodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPeriodModalOpen(false)} />
          <div className="relative w-full max-w-xl app-panel rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold">{editingPeriod ? 'Edit Period' : 'Create Period'}</h4>
                <p className="text-gray-600 text-sm">Define date range and status.</p>
              </div>
              <button onClick={() => setPeriodModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-50">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={periodForm.name}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, name: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  placeholder="e.g., Q1 2026"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Type</label>
                <select
                  value={periodForm.period_type}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, period_type: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={periodForm.status}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, status: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Start date</label>
                <input
                  type="date"
                  value={periodForm.start_date}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, start_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">End date</label>
                <input
                  type="date"
                  value={periodForm.end_date}
                  onChange={(e) => setPeriodForm((s) => ({ ...s, end_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPeriodModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={savePeriod}
                disabled={periodSaving || !periodForm.name.trim() || !periodForm.start_date || !periodForm.end_date}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {periodSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
