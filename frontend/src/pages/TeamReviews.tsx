import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import type { Employee, EvaluationPeriod, KPI, PerformanceReview } from '../types';

type ItemDraft = {
  score: number;
  comment: string;
};

const fmt = (val?: string) => {
  if (!val) return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return val;
  return n.toFixed(2);
};

const TeamReviews = () => {
  const { employeeProfile } = useAuth();
  const isManager = (employeeProfile?.direct_reports_count || 0) > 0;

  const [team, setTeam] = useState<Employee[]>([]);
  const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | ''>('');

  const [draft, setDraft] = useState<Record<number, ItemDraft>>({});
  const [finalComment, setFinalComment] = useState('');
  const [currentReview, setCurrentReview] = useState<PerformanceReview | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBootstrap = async () => {
    setLoading(true);
    try {
      const [teamRes, periodRes, kpiRes] = await Promise.all([
        api.get('/employees/team/'),
        api.get('/performance/periods/'),
        api.get('/performance/kpis/?is_active=true'),
      ]);

      const teamData = (teamRes.data?.results ?? teamRes.data) as Employee[];
      const periodData = (periodRes.data?.results ?? periodRes.data) as EvaluationPeriod[];
      const kpiData = (kpiRes.data?.results ?? kpiRes.data) as KPI[];

      setTeam(teamData);
      setPeriods(periodData.filter((p) => p.status === 'ACTIVE'));
      setKpis(kpiData.filter((k) => k.is_active));

      if (teamData.length > 0) {
        setSelectedEmployeeId(teamData[0].employee_id);
      }
      if (periodData.length > 0) {
        const active = periodData.filter((p) => p.status === 'ACTIVE');
        if (active.length > 0) setSelectedPeriodId(active[0].period_id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isManager) return;
    fetchBootstrap();
  }, [isManager]);

  const initDraftFromKpis = (review?: PerformanceReview | null) => {
    const base: Record<number, ItemDraft> = {};
    kpis.forEach((k) => {
      base[k.kpi_id] = { score: 0, comment: '' };
    });

    if (review?.items) {
      review.items.forEach((it) => {
        base[it.kpi] = { score: it.score, comment: it.comment || '' };
      });
    }

    setDraft(base);
    setFinalComment(review?.final_comment || '');
  };

  const fetchExistingReview = async () => {
    if (!selectedEmployeeId || !selectedPeriodId) return;
    try {
      const res = await api.get(
        `/performance/reviews/?employee=${selectedEmployeeId}&period=${selectedPeriodId}&ordering=-created_at`
      );
      const data = (res.data?.results ?? res.data) as PerformanceReview[];
      const found = data[0] || null;
      setCurrentReview(found);
      initDraftFromKpis(found);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load review');
    }
  };

  useEffect(() => {
    if (!kpis.length) return;
    if (!selectedEmployeeId || !selectedPeriodId) {
      initDraftFromKpis(null);
      return;
    }
    fetchExistingReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId, selectedPeriodId, kpis.length]);

  const selectedEmployee = useMemo(
    () => team.find((e) => e.employee_id === selectedEmployeeId),
    [team, selectedEmployeeId]
  );
  const selectedPeriod = useMemo(
    () => periods.find((p) => p.period_id === selectedPeriodId),
    [periods, selectedPeriodId]
  );

  const updateDraft = (kpiId: number, patch: Partial<ItemDraft>) => {
    setDraft((prev) => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], ...patch },
    }));
  };

  const saveReview = async () => {
    if (!selectedEmployeeId || !selectedPeriodId) {
      toast.error('Please select an employee and an active period.');
      return;
    }

    if (!kpis.length) {
      toast.error('No active KPIs found. Ask HR to create/activate KPIs.');
      return;
    }

    setSaving(true);
    try {
      const items = kpis.map((k) => {
        const it = draft[k.kpi_id] || { score: 0, comment: '' };
        return {
          kpi: k.kpi_id,
          score: Number(it.score),
          comment: it.comment.trim() || null,
        };
      });

      const payload: any = {
        employee: selectedEmployeeId,
        period: selectedPeriodId,
        final_comment: finalComment.trim() || null,
        items,
      };

      let res;
      if (currentReview?.review_id) {
        res = await api.patch(`/performance/reviews/${currentReview.review_id}/`, payload);
        toast.success('Review updated');
      } else {
        res = await api.post('/performance/reviews/', payload);
        toast.success('Review created');
      }

      setCurrentReview(res.data);
      initDraftFromKpis(res.data);
    } catch (err: any) {
      const detail = err?.response?.data;
      toast.error(detail?.detail || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  if (!isManager) {
    return (
      <div className="app-panel rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-2">Team Reviews</h3>
        <p className="text-gray-600">This section is available for managers only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Team Performance Reviews</h3>
            <p className="text-gray-600 mt-1">Score your team members based on HR-defined KPIs.</p>
          </div>
          {currentReview && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Score</div>
              <div className="text-3xl font-semibold">{fmt(currentReview.total_score)}</div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
            >
              <option value="">Select employee</option>
              {team.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Active Period</label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value ? Number(e.target.value) : '')}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
            >
              <option value="">Select period</option>
              {periods.map((p) => (
                <option key={p.period_id} value={p.period_id}>
                  {p.name}
                </option>
              ))}
            </select>
            {!periods.length && <div className="text-xs text-amber-700 mt-1">No ACTIVE period. Ask HR to activate one.</div>}
          </div>
          <div className="flex items-end">
            <button
              onClick={saveReview}
              disabled={saving || loading}
              className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : currentReview ? 'Save Changes' : 'Create Review'}
            </button>
          </div>
        </div>
      </div>

      <div className="app-panel rounded-2xl p-6">
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : !selectedEmployee || !selectedPeriod ? (
          <div className="text-gray-500">Select an employee and an active period to start scoring.</div>
        ) : !kpis.length ? (
          <div className="text-gray-500">No active KPIs. HR must create/activate KPIs first.</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold">Scoring Form</h4>
                <p className="text-gray-600 text-sm">
                  Employee: <span className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                  {' '}· Period: <span className="font-medium">{selectedPeriod.name}</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="py-3 pr-4">KPI</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Weight</th>
                    <th className="py-3 pr-4">Score (0-100)</th>
                    <th className="py-3">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((k) => (
                    <tr key={k.kpi_id} className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{k.title}</div>
                        {k.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{k.description}</div>}
                      </td>
                      <td className="py-3 pr-4">{k.category}</td>
                      <td className="py-3 pr-4">{k.weight}</td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={draft[k.kpi_id]?.score ?? 0}
                          onChange={(e) => updateDraft(k.kpi_id, { score: Number(e.target.value) })}
                          className="w-28 px-3 py-2 border border-gray-200 rounded-xl bg-white"
                        />
                      </td>
                      <td className="py-3">
                        <textarea
                          value={draft[k.kpi_id]?.comment ?? ''}
                          onChange={(e) => updateDraft(k.kpi_id, { comment: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                          rows={2}
                          placeholder="Optional comment"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700">Final Comment (optional)</label>
              <textarea
                value={finalComment}
                onChange={(e) => setFinalComment(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                rows={4}
                placeholder="Overall evaluation summary..."
              />
            </div>
          </>
        )}
      </div>

      {currentReview && currentReview.items && currentReview.items.length > 0 && (
        <div className="app-panel rounded-2xl p-6">
          <h4 className="text-xl font-semibold mb-4">Saved Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4">KPI</th>
                  <th className="py-3 pr-4">Weight</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Weighted</th>
                  <th className="py-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {currentReview.items.map((it) => (
                  <tr key={it.item_id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium">{it.kpi_title || `#${it.kpi}`}</td>
                    <td className="py-3 pr-4">{it.kpi_weight ?? '—'}</td>
                    <td className="py-3 pr-4">{it.score}</td>
                    <td className="py-3 pr-4 font-semibold">{fmt(it.weighted_score)}</td>
                    <td className="py-3">{it.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamReviews;
