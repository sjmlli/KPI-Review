import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { Asset, AssetAssignment, Employee } from '../types';

type AssetTab = 'inventory' | 'assignments';

const assetTypes: Asset['asset_type'][] = ['Laptop', 'Phone', 'AccessCard', 'Monitor', 'Other'];

const Assets: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssetTab>('inventory');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [assetForm, setAssetForm] = useState({
    asset_type: 'Laptop',
    asset_tag: '',
    serial_number: '',
    model: '',
    status: 'Available',
    purchase_date: '',
    notes: '',
  });

  const [assignmentForm, setAssignmentForm] = useState({
    asset: '',
    employee: '',
    notes: '',
  });

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetRes, assignmentRes, employeeRes] = await Promise.all([
        api.get('/hr/assets/'),
        api.get('/hr/asset-assignments/'),
        api.get('/employees/'),
      ]);
      setAssets(normalizeList(assetRes.data));
      setAssignments(normalizeList(assignmentRes.data));
      setEmployees(normalizeList(employeeRes.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/assets/', {
        asset_type: assetForm.asset_type,
        asset_tag: assetForm.asset_tag,
        serial_number: assetForm.serial_number || null,
        model: assetForm.model || null,
        status: assetForm.status,
        purchase_date: assetForm.purchase_date || null,
        notes: assetForm.notes || null,
      });
      toast.success('Asset added');
      setAssetForm({
        asset_type: 'Laptop',
        asset_tag: '',
        serial_number: '',
        model: '',
        status: 'Available',
        purchase_date: '',
        notes: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add asset');
    }
  };

  const handleAssignmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/asset-assignments/', {
        asset: parseInt(assignmentForm.asset, 10),
        employee: parseInt(assignmentForm.employee, 10),
        notes: assignmentForm.notes || null,
      });
      toast.success('Asset assigned');
      setAssignmentForm({ asset: '', employee: '', notes: '' });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign asset');
    }
  };

  const handleReturn = async (assignmentId: number) => {
    try {
      await api.post(`/hr/asset-assignments/${assignmentId}/return_asset/`, {});
      toast.success('Asset returned');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to return asset');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
        <p className="text-gray-600 mt-1">Track company assets and handovers</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Assignments
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Asset</h2>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <select
                value={assetForm.asset_type}
                onChange={(event) => setAssetForm({ ...assetForm, asset_type: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Asset tag"
                value={assetForm.asset_tag}
                onChange={(event) => setAssetForm({ ...assetForm, asset_tag: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Serial number"
                value={assetForm.serial_number}
                onChange={(event) => setAssetForm({ ...assetForm, serial_number: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Model"
                value={assetForm.model}
                onChange={(event) => setAssetForm({ ...assetForm, model: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={assetForm.purchase_date}
                onChange={(event) => setAssetForm({ ...assetForm, purchase_date: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Notes"
                value={assetForm.notes}
                onChange={(event) => setAssetForm({ ...assetForm, notes: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Save Asset
              </button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.asset_id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{asset.asset_tag}</p>
                  <p className="text-sm text-gray-600">
                    {asset.asset_type} • {asset.model || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Status: {asset.status}</p>
                </div>
              ))}
              {assets.length === 0 && <p className="text-sm text-gray-500">No assets yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Asset</h2>
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <select
                required
                value={assignmentForm.asset}
                onChange={(event) => setAssignmentForm({ ...assignmentForm, asset: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.asset_tag} ({asset.status})
                  </option>
                ))}
              </select>
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
              <textarea
                placeholder="Notes"
                value={assignmentForm.notes}
                onChange={(event) => setAssignmentForm({ ...assignmentForm, notes: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Assign Asset
              </button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h2>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{assignment.asset_tag}</p>
                  <p className="text-sm text-gray-600">{assignment.employee_name}</p>
                  <p className="text-xs text-gray-500">
                    Assigned: {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleString() : 'N/A'}
                  </p>
                  {assignment.returned_at ? (
                    <p className="text-xs text-gray-500">
                      Returned: {new Date(assignment.returned_at).toLocaleString()}
                    </p>
                  ) : (
                    <button
                      onClick={() => handleReturn(assignment.assignment_id)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                    >
                      Mark as returned
                    </button>
                  )}
                </div>
              ))}
              {assignments.length === 0 && <p className="text-sm text-gray-500">No assignments yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
