import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Policy, PolicyAcknowledgment } from '../types';

const EmployeePolicies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadData = async () => {
    setLoading(true);
    try {
      const [policyRes, ackRes] = await Promise.all([
        api.get('/hr/policies/'),
        api.get('/hr/policy-acknowledgments/'),
      ]);
      setPolicies(normalizeList(policyRes.data));
      setAcknowledgments(normalizeList(ackRes.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const acknowledgedPolicyIds = new Set(acknowledgments.map((ack) => ack.policy));

  const handleAcknowledge = async (policyId: number, status: 'Acknowledged' | 'Declined') => {
    try {
      await api.post('/hr/policy-acknowledgments/', { policy: policyId, status });
      toast.success(status === 'Acknowledged' ? 'Policy acknowledged' : 'Policy declined');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit acknowledgment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Policies</h1>
        <p className="text-gray-600 mt-1">Review and acknowledge active policies</p>
      </div>

      <div className="space-y-4">
        {policies.map((policy) => {
          const acknowledged = acknowledgedPolicyIds.has(policy.policy_id);
          return (
            <div key={policy.policy_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{policy.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">Version {policy.version}</p>
                </div>
                {policy.require_ack && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    acknowledged ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {acknowledged ? 'Acknowledged' : 'Pending'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-4 whitespace-pre-line">{policy.content}</p>
              {policy.require_ack && !acknowledged && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAcknowledge(policy.policy_id, 'Acknowledged')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleAcknowledge(policy.policy_id, 'Declined')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {policies.length === 0 && <p className="text-sm text-gray-500">No active policies available.</p>}
      </div>
    </div>
  );
};

export default EmployeePolicies;
