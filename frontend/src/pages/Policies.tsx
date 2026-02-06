import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Policy, PolicyAcknowledgment } from '../types';

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [loading, setLoading] = useState(true);

  const [policyForm, setPolicyForm] = useState({
    title: '',
    content: '',
    version: '1.0',
    effective_date: '',
    is_active: true,
    require_ack: true,
  });

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

  const handlePolicySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/policies/', policyForm);
      toast.success('Policy created');
      setPolicyForm({
        title: '',
        content: '',
        version: '1.0',
        effective_date: '',
        is_active: true,
        require_ack: true,
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create policy');
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
        <h1 className="text-2xl font-bold text-gray-900">Policy Center</h1>
        <p className="text-gray-600 mt-1">Publish policies and track acknowledgments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Policy</h2>
          <form onSubmit={handlePolicySubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Policy title"
              value={policyForm.title}
              onChange={(event) => setPolicyForm({ ...policyForm, title: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              required
              placeholder="Policy content"
              value={policyForm.content}
              onChange={(event) => setPolicyForm({ ...policyForm, content: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={6}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={policyForm.version}
                onChange={(event) => setPolicyForm({ ...policyForm, version: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Version"
              />
              <input
                type="date"
                required
                value={policyForm.effective_date}
                onChange={(event) => setPolicyForm({ ...policyForm, effective_date: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={policyForm.is_active}
                  onChange={(event) => setPolicyForm({ ...policyForm, is_active: event.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={policyForm.require_ack}
                  onChange={(event) => setPolicyForm({ ...policyForm, require_ack: event.target.checked })}
                  className="h-4 w-4"
                />
                Require acknowledgment
              </label>
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
              Save Policy
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Policies</h2>
          <div className="space-y-3">
            {policies.map((policy) => (
              <div key={policy.policy_id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{policy.title}</p>
                <p className="text-sm text-gray-600">Version {policy.version}</p>
                <p className="text-xs text-gray-500">Effective: {policy.effective_date}</p>
              </div>
            ))}
            {policies.length === 0 && <p className="text-sm text-gray-500">No policies yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgments</h2>
        <div className="space-y-3">
          {acknowledgments.map((ack) => (
            <div key={ack.acknowledgment_id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{ack.policy_title}</p>
              <p className="text-sm text-gray-600">{ack.employee_name}</p>
              <p className="text-xs text-gray-500">Status: {ack.status}</p>
            </div>
          ))}
          {acknowledgments.length === 0 && <p className="text-sm text-gray-500">No acknowledgments yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Policies;
