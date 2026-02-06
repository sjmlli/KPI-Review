import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { OnboardingTask, EmployeeDocument } from '../types';

const docTypes: EmployeeDocument['doc_type'][] = ['ID', 'Bank', 'Tax', 'Contract', 'Other'];

const EmployeeOnboarding: React.FC = () => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [docForm, setDocForm] = useState({
    doc_type: 'ID',
    title: '',
    file: null as File | null,
  });

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes, docRes] = await Promise.all([
        api.get('/hr/onboarding-tasks/'),
        api.get('/hr/employee-documents/'),
      ]);
      setTasks(normalizeList(taskRes.data));
      setDocuments(normalizeList(docRes.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markComplete = async (taskId: number) => {
    try {
      await api.post(`/hr/onboarding-tasks/${taskId}/complete/`, {});
      toast.success('Task completed');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to complete task');
    }
  };

  const handleDocumentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!docForm.file) {
      toast.error('Select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('doc_type', docForm.doc_type);
    formData.append('title', docForm.title);
    formData.append('file', docForm.file);

    try {
      await api.post('/hr/employee-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      setDocForm({ doc_type: 'ID', title: '', file: null });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Onboarding</h1>
        <p className="text-gray-600 mt-1">Complete tasks and upload required documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.task_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                    <p className="text-xs text-gray-500">Status: {task.status}</p>
                  </div>
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => markComplete(task.task_id)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-gray-500">No onboarding tasks yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <select
              value={docForm.doc_type}
              onChange={(event) => setDocForm({ ...docForm, doc_type: event.target.value as EmployeeDocument['doc_type'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {docTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Document title"
              value={docForm.title}
              onChange={(event) => setDocForm({ ...docForm, title: event.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="file"
              required
              onChange={(event) =>
                setDocForm({ ...docForm, file: event.target.files ? event.target.files[0] : null })
              }
              className="w-full text-sm"
            />
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
              Upload Document
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {documents.map((doc) => (
              <div key={doc.document_id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{doc.title}</p>
                <p className="text-xs text-gray-500">Status: {doc.status}</p>
              </div>
            ))}
            {documents.length === 0 && <p className="text-sm text-gray-500">No documents uploaded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
