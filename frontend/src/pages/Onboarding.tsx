import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type {
  Employee,
  OnboardingChecklistTemplate,
  OnboardingTaskTemplate,
  OnboardingTask,
  EmployeeDocument,
} from '../types';

type OnboardingTab = 'checklists' | 'task-templates' | 'tasks' | 'documents';

const docTypes: EmployeeDocument['doc_type'][] = ['ID', 'Bank', 'Tax', 'Contract', 'Other'];

const Onboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OnboardingTab>('checklists');
  const [checklists, setChecklists] = useState<OnboardingChecklistTemplate[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<OnboardingTaskTemplate[]>([]);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [checklistForm, setChecklistForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const [taskTemplateForm, setTaskTemplateForm] = useState({
    checklist: '',
    title: '',
    description: '',
    assigned_to: 'Employee',
    due_offset_days: '0',
  });

  const [taskForm, setTaskForm] = useState({
    employee: '',
    title: '',
    description: '',
    assigned_to: 'Employee',
    due_date: '',
  });

  const [generateForm, setGenerateForm] = useState({
    checklist: '',
    employee: '',
    start_date: '',
  });

  const [docForm, setDocForm] = useState({
    employee: '',
    doc_type: 'ID',
    title: '',
    file: null as File | null,
  });

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const loadData = async () => {
    setLoading(true);
    try {
      const [checklistRes, templateRes, taskRes, docRes, employeeRes] = await Promise.all([
        api.get('/hr/onboarding-checklists/'),
        api.get('/hr/onboarding-task-templates/'),
        api.get('/hr/onboarding-tasks/'),
        api.get('/hr/employee-documents/'),
        api.get('/employees/'),
      ]);
      setChecklists(normalizeList(checklistRes.data));
      setTaskTemplates(normalizeList(templateRes.data));
      setTasks(normalizeList(taskRes.data));
      setDocuments(normalizeList(docRes.data));
      setEmployees(normalizeList(employeeRes.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChecklistSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/onboarding-checklists/', checklistForm);
      toast.success('Checklist created');
      setChecklistForm({ name: '', description: '', is_active: true });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create checklist');
    }
  };

  const handleTaskTemplateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/onboarding-task-templates/', {
        checklist: parseInt(taskTemplateForm.checklist, 10),
        title: taskTemplateForm.title,
        description: taskTemplateForm.description || null,
        assigned_to: taskTemplateForm.assigned_to,
        due_offset_days: parseInt(taskTemplateForm.due_offset_days, 10),
      });
      toast.success('Task template created');
      setTaskTemplateForm({
        checklist: '',
        title: '',
        description: '',
        assigned_to: 'Employee',
        due_offset_days: '0',
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create task template');
    }
  };

  const handleTaskSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/hr/onboarding-tasks/', {
        employee: parseInt(taskForm.employee, 10),
        title: taskForm.title,
        description: taskForm.description || null,
        assigned_to: taskForm.assigned_to,
        due_date: taskForm.due_date || null,
      });
      toast.success('Task created');
      setTaskForm({
        employee: '',
        title: '',
        description: '',
        assigned_to: 'Employee',
        due_date: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create task');
    }
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post(`/hr/onboarding-checklists/${generateForm.checklist}/generate_tasks/`, {
        employee: parseInt(generateForm.employee, 10),
        start_date: generateForm.start_date || null,
      });
      toast.success('Tasks generated');
      setGenerateForm({ checklist: '', employee: '', start_date: '' });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to generate tasks');
    }
  };

  const handleTaskStatus = async (taskId: number, status: OnboardingTask['status']) => {
    try {
      await api.patch(`/hr/onboarding-tasks/${taskId}/`, { status });
      toast.success('Task updated');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update task');
    }
  };

  const handleDocumentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!docForm.file) {
      toast.error('Select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('employee', docForm.employee);
    formData.append('doc_type', docForm.doc_type);
    formData.append('title', docForm.title);
    formData.append('file', docForm.file);
    try {
      await api.post('/hr/employee-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      setDocForm({ employee: '', doc_type: 'ID', title: '', file: null });
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload document');
    }
  };

  const updateDocumentStatus = async (documentId: number, action: 'verify' | 'reject') => {
    try {
      await api.post(`/hr/employee-documents/${documentId}/${action}/`, {});
      toast.success(`Document ${action === 'verify' ? 'verified' : 'rejected'}`);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update document');
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
        <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
        <p className="text-gray-600 mt-1">Manage onboarding checklists, tasks, and documents</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['checklists', 'task-templates', 'tasks', 'documents'] as OnboardingTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {tab === 'checklists' && 'Checklists'}
            {tab === 'task-templates' && 'Task Templates'}
            {tab === 'tasks' && 'Tasks'}
            {tab === 'documents' && 'Documents'}
          </button>
        ))}
      </div>

      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Checklist</h2>
            <form onSubmit={handleChecklistSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Checklist name"
                value={checklistForm.name}
                onChange={(event) => setChecklistForm({ ...checklistForm, name: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={checklistForm.description}
                onChange={(event) => setChecklistForm({ ...checklistForm, description: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checklistForm.is_active}
                  onChange={(event) => setChecklistForm({ ...checklistForm, is_active: event.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Save Checklist
              </button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Checklists</h2>
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <div key={checklist.template_id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{checklist.name}</p>
                  <p className="text-sm text-gray-600">{checklist.description || 'No description'}</p>
                </div>
              ))}
              {checklists.length === 0 && <p className="text-sm text-gray-500">No checklists yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'task-templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Task Template</h2>
            <form onSubmit={handleTaskTemplateSubmit} className="space-y-4">
              <select
                required
                value={taskTemplateForm.checklist}
                onChange={(event) => setTaskTemplateForm({ ...taskTemplateForm, checklist: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select checklist</option>
                {checklists.map((checklist) => (
                  <option key={checklist.template_id} value={checklist.template_id}>
                    {checklist.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Task title"
                value={taskTemplateForm.title}
                onChange={(event) => setTaskTemplateForm({ ...taskTemplateForm, title: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={taskTemplateForm.description}
                onChange={(event) => setTaskTemplateForm({ ...taskTemplateForm, description: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={taskTemplateForm.assigned_to}
                  onChange={(event) => setTaskTemplateForm({ ...taskTemplateForm, assigned_to: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Employee">Employee</option>
                  <option value="HR">HR</option>
                </select>
                <input
                  type="number"
                  value={taskTemplateForm.due_offset_days}
                  onChange={(event) =>
                    setTaskTemplateForm({ ...taskTemplateForm, due_offset_days: event.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Due offset (days)"
                />
              </div>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Save Template
              </button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Templates</h2>
            <div className="space-y-3">
              {taskTemplates.map((template) => (
                <div key={template.task_template_id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{template.title}</p>
                  <p className="text-sm text-gray-600">{template.checklist_name}</p>
                  <p className="text-xs text-gray-500">Assigned to: {template.assigned_to}</p>
                </div>
              ))}
              {taskTemplates.length === 0 && <p className="text-sm text-gray-500">No templates yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Task</h2>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <select
                  required
                  value={taskForm.employee}
                  onChange={(event) => setTaskForm({ ...taskForm, employee: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={taskForm.assigned_to}
                    onChange={(event) => setTaskForm({ ...taskForm, assigned_to: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR">HR</option>
                  </select>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Save Task
                </button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate from Checklist</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <select
                  required
                  value={generateForm.checklist}
                  onChange={(event) => setGenerateForm({ ...generateForm, checklist: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select checklist</option>
                  {checklists.map((checklist) => (
                    <option key={checklist.template_id} value={checklist.template_id}>
                      {checklist.name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  value={generateForm.employee}
                  onChange={(event) => setGenerateForm({ ...generateForm, employee: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={generateForm.start_date}
                  onChange={(event) => setGenerateForm({ ...generateForm, start_date: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  Generate Tasks
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.task_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.employee_name}</p>
                      <p className="text-xs text-gray-500">Assigned to: {task.assigned_to}</p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(event) => handleTaskStatus(task.task_id, event.target.value as OnboardingTask['status'])}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-gray-500">No tasks yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <select
                required
                value={docForm.employee}
                onChange={(event) => setDocForm({ ...docForm, employee: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                  </option>
                ))}
              </select>
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
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.document_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-600">{doc.employee_name}</p>
                      <p className="text-xs text-gray-500">Type: {doc.doc_type}</p>
                      <p className="text-xs text-gray-500">Status: {doc.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateDocumentStatus(doc.document_id, 'verify')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => updateDocumentStatus(doc.document_id, 'reject')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {documents.length === 0 && <p className="text-sm text-gray-500">No documents yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
