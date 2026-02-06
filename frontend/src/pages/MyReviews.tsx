import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import type { PerformanceReview } from '../types';

const scoreLabel = (score?: string) => {
  if (score == null) return '—';
  const n = Number(score);
  if (Number.isNaN(n)) return score;
  return n.toFixed(2);
};

const MyReviews = () => {
  const { employeeProfile } = useAuth();
  const myEmployeeId = employeeProfile?.employee_id;

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    if (!myEmployeeId) return;
    setLoading(true);
    try {
      const res = await api.get(`/performance/reviews/?employee=${myEmployeeId}&ordering=-created_at`);
      const data = (res.data?.results ?? res.data) as PerformanceReview[];
      setReviews(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [myEmployeeId]);

  const hasReviews = useMemo(() => reviews.length > 0, [reviews.length]);

  return (
    <div className="space-y-6">
      <div className="app-panel rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">My Performance Reviews</h3>
            <p className="text-gray-600 mt-1">See your evaluation history and KPI breakdown.</p>
          </div>
        </div>
      </div>

      <div className="app-panel rounded-2xl p-6">
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : !hasReviews ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4">Period</th>
                  <th className="py-3 pr-4">Manager</th>
                  <th className="py-3 pr-4">Total Score</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.review_id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{r.period_detail?.name || `#${r.period}`}</div>
                      {r.period_detail && (
                        <div className="text-xs text-gray-500 mt-1">
                          {r.period_detail.start_date} → {r.period_detail.end_date}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">{r.manager_name || '—'}</td>
                    <td className="py-3 pr-4 font-semibold">{scoreLabel(r.total_score)}</td>
                    <td className="py-3 pr-4">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    <td className="py-3">
                      <Link
                        to={`/employee/reviews/${r.review_id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
