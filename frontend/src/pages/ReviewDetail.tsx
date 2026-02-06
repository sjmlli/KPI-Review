import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../config/api';
import type { PerformanceReview } from '../types';

const fmt = (val?: string) => {
  if (!val) return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return val;
  return n.toFixed(2);
};

const ReviewDetail = () => {
  const { id } = useParams();
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReview = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/performance/reviews/${id}/`);
      setReview(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [id]);

  const items = useMemo(() => review?.items || [], [review?.items]);

  if (loading) {
    return (
      <div className="app-panel rounded-2xl p-6">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="app-panel rounded-2xl p-6">
        <div className="text-gray-600">Review not found.</div>
        <div className="mt-4">
          <Link to="/employee/reviews" className="text-indigo-600 hover:underline">
            Back to My Reviews
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Performance Review</div>
            <h3 className="text-2xl font-semibold mt-1">{review.period_detail?.name || `Period #${review.period}`}</h3>
            <div className="text-gray-600 mt-2">
              <div>
                <span className="text-gray-500">Employee:</span> {review.employee_name || `#${review.employee}`}
              </div>
              <div>
                <span className="text-gray-500">Manager:</span> {review.manager_name || '—'}
              </div>
              {review.period_detail && (
                <div>
                  <span className="text-gray-500">Dates:</span> {review.period_detail.start_date} → {review.period_detail.end_date}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-gray-500">Total Score</div>
            <div className="text-4xl font-semibold">{fmt(review.total_score)}</div>
            <Link
              to="/employee/reviews"
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="app-panel rounded-2xl p-6">
        <h4 className="text-xl font-semibold mb-4">KPI Breakdown</h4>
        {items.length === 0 ? (
          <div className="text-gray-500">No KPI items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-3 pr-4">KPI</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Weight</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Weighted</th>
                  <th className="py-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.item_id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium">{it.kpi_title || `#${it.kpi}`}</td>
                    <td className="py-3 pr-4">{it.kpi_category || '—'}</td>
                    <td className="py-3 pr-4">{it.kpi_weight ?? '—'}</td>
                    <td className="py-3 pr-4">{it.score}</td>
                    <td className="py-3 pr-4 font-semibold">{fmt(it.weighted_score)}</td>
                    <td className="py-3">{it.comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {review.final_comment && (
          <div className="mt-6">
            <h5 className="text-sm font-semibold text-gray-700">Final Comment</h5>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">{review.final_comment}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
