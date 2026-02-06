import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type {
  Department,
  Employee,
  JobPosting,
  RecruitmentApplication,
  RecruitmentIntegration,
} from '../types';

type RecruitmentTab = 'postings' | 'applications' | 'integrations';

const jobStatuses = ['Draft', 'Open', 'Closed'];
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const applicationStatuses = ['Applied', 'Screening', 'Interviewed', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];
const offerStatuses = ['Pending', 'Offered', 'Accepted', 'Rejected'];
const integrationProviders: RecruitmentIntegration['provider'][] = ['LinkedIn', 'Naukri'];

const RecruitmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecruitmentTab>('postings');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [integrations, setIntegrations] = useState<RecruitmentIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPostingModal, setShowPostingModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const [editingPosting, setEditingPosting] = useState<JobPosting | null>(null);
  const [editingApplication, setEditingApplication] = useState<RecruitmentApplication | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<RecruitmentIntegration | null>(null);

  const [postingForm, setPostingForm] = useState({
    job_title: '',
    department: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: 'Full-time',
    salary_range_min: '',
    salary_range_max: '',
    closing_date: '',
    status: 'Draft',
    created_by: '',
  });

  const [applicationForm, setApplicationForm] = useState({
    job_posting: '',
    candidate_name: '',
    email: '',
    phone_number: '',
    profile_url: '',
    resume_url: '',
    cover_letter: '',
    status: 'Applied',
    interview_date: '',
    interview_notes: '',
    offer_status: '',
    offer_salary: '',
    offer_date: '',
    hired_employee: '',
    notes: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [integrationForm, setIntegrationForm] = useState({
    provider: 'LinkedIn' as RecruitmentIntegration['provider'],
    display_name: '',
    is_active: true,
    auto_post_jobs: true,
    auto_sync_applicants: true,
    credentials: {
      api_key: '',
      client_id: '',
      client_secret: '',
      access_token: '',
      refresh_token: '',
      company_id: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDepartments(),
          fetchEmployees(),
          fetchJobPostings(),
          fetchApplications(),
          fetchIntegrations(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const normalizeList = (data: any) => data?.results ?? data ?? [];

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/employees/departments/');
      setDepartments(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch departments');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      setEmployees(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch employees');
    }
  };

  const fetchJobPostings = async () => {
    try {
      const response = await api.get('/recruitment/job-postings/');
      setJobPostings(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch job postings');
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/recruitment/applications/');
      setApplications(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch applications');
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/recruitment/integrations/');
      setIntegrations(normalizeList(response.data));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch integrations');
    }
  };

  const resetPostingForm = () => {
    setPostingForm({
      job_title: '',
      department: '',
      description: '',
      requirements: '',
      location: '',
      employment_type: 'Full-time',
      salary_range_min: '',
      salary_range_max: '',
      closing_date: '',
      status: 'Draft',
      created_by: '',
    });
    setEditingPosting(null);
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      job_posting: '',
      candidate_name: '',
      email: '',
      phone_number: '',
      profile_url: '',
      resume_url: '',
      cover_letter: '',
      status: 'Applied',
      interview_date: '',
      interview_notes: '',
      offer_status: '',
      offer_salary: '',
      offer_date: '',
      hired_employee: '',
      notes: '',
    });
    setResumeFile(null);
    setEditingApplication(null);
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      provider: 'LinkedIn',
      display_name: '',
      is_active: true,
      auto_post_jobs: true,
      auto_sync_applicants: true,
      credentials: {
        api_key: '',
        client_id: '',
        client_secret: '',
        access_token: '',
        refresh_token: '',
        company_id: '',
      },
    });
    setEditingIntegration(null);
  };

  const handlePostingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      job_title: postingForm.job_title,
      department: postingForm.department ? parseInt(postingForm.department, 10) : null,
      description: postingForm.description,
      requirements: postingForm.requirements,
      location: postingForm.location || null,
      employment_type: postingForm.employment_type,
      salary_range_min: postingForm.salary_range_min ? parseFloat(postingForm.salary_range_min) : null,
      salary_range_max: postingForm.salary_range_max ? parseFloat(postingForm.salary_range_max) : null,
      closing_date: postingForm.closing_date,
      status: postingForm.status,
      created_by: postingForm.created_by ? parseInt(postingForm.created_by, 10) : null,
    };

    try {
      if (editingPosting) {
        await api.patch(`/recruitment/job-postings/${editingPosting.job_posting_id}/`, payload);
        toast.success('Job posting updated');
      } else {
        await api.post('/recruitment/job-postings/', payload);
        toast.success('Job posting created');
      }
      setShowPostingModal(false);
      resetPostingForm();
      fetchJobPostings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save job posting');
    }
  };

  const buildApplicationPayload = () => {
    if (resumeFile) {
      const formData = new FormData();
      formData.append('job_posting', applicationForm.job_posting);
      formData.append('candidate_name', applicationForm.candidate_name);
      formData.append('email', applicationForm.email);
      formData.append('status', applicationForm.status);
      if (applicationForm.phone_number) formData.append('phone_number', applicationForm.phone_number);
      if (applicationForm.profile_url) formData.append('profile_url', applicationForm.profile_url);
      if (applicationForm.resume_url) formData.append('resume_url', applicationForm.resume_url);
      if (applicationForm.cover_letter) formData.append('cover_letter', applicationForm.cover_letter);
      if (applicationForm.interview_date) formData.append('interview_date', applicationForm.interview_date);
      if (applicationForm.interview_notes) formData.append('interview_notes', applicationForm.interview_notes);
      if (applicationForm.offer_status) formData.append('offer_status', applicationForm.offer_status);
      if (applicationForm.offer_salary) formData.append('offer_salary', applicationForm.offer_salary);
      if (applicationForm.offer_date) formData.append('offer_date', applicationForm.offer_date);
      if (applicationForm.hired_employee) formData.append('hired_employee', applicationForm.hired_employee);
      if (applicationForm.notes) formData.append('notes', applicationForm.notes);
      formData.append('resume', resumeFile);
      return formData;
    }

    return {
      job_posting: parseInt(applicationForm.job_posting, 10),
      candidate_name: applicationForm.candidate_name,
      email: applicationForm.email,
      phone_number: applicationForm.phone_number || null,
      profile_url: applicationForm.profile_url || null,
      resume_url: applicationForm.resume_url || null,
      cover_letter: applicationForm.cover_letter || null,
      status: applicationForm.status,
      interview_date: applicationForm.interview_date || null,
      interview_notes: applicationForm.interview_notes || null,
      offer_status: applicationForm.offer_status || null,
      offer_salary: applicationForm.offer_salary ? parseFloat(applicationForm.offer_salary) : null,
      offer_date: applicationForm.offer_date || null,
      hired_employee: applicationForm.hired_employee ? parseInt(applicationForm.hired_employee, 10) : null,
      notes: applicationForm.notes || null,
    };
  };

  const handleApplicationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = buildApplicationPayload();
    const config = payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined;

    try {
      if (editingApplication) {
        await api.patch(
          `/recruitment/applications/${editingApplication.recruitment_id}/`,
          payload,
          config
        );
        toast.success('Application updated');
      } else {
        await api.post('/recruitment/applications/', payload, config);
        toast.success('Application created');
      }
      setShowApplicationModal(false);
      resetApplicationForm();
      fetchApplications();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save application');
    }
  };

  const handleDeletePosting = async (postingId: number) => {
    if (!window.confirm('Delete this job posting?')) {
      return;
    }
    try {
      await api.delete(`/recruitment/job-postings/${postingId}/`);
      toast.success('Job posting deleted');
      fetchJobPostings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete job posting');
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    if (!window.confirm('Delete this application?')) {
      return;
    }
    try {
      await api.delete(`/recruitment/applications/${applicationId}/`);
      toast.success('Application deleted');
      fetchApplications();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete application');
    }
  };

  const startEditPosting = (posting: JobPosting) => {
    setEditingPosting(posting);
    setPostingForm({
      job_title: posting.job_title,
      department: posting.department ? posting.department.toString() : '',
      description: posting.description,
      requirements: posting.requirements,
      location: posting.location || '',
      employment_type: posting.employment_type,
      salary_range_min: posting.salary_range_min?.toString() || '',
      salary_range_max: posting.salary_range_max?.toString() || '',
      closing_date: posting.closing_date,
      status: posting.status,
      created_by: posting.created_by ? posting.created_by.toString() : '',
    });
    setShowPostingModal(true);
  };

  const startEditApplication = (application: RecruitmentApplication) => {
    setEditingApplication(application);
    setApplicationForm({
      job_posting: application.job_posting.toString(),
      candidate_name: application.candidate_name,
      email: application.email,
      phone_number: application.phone_number || '',
      profile_url: application.profile_url || '',
      resume_url: application.resume_url || '',
      cover_letter: application.cover_letter || '',
      status: application.status,
      interview_date: application.interview_date || '',
      interview_notes: application.interview_notes || '',
      offer_status: application.offer_status || '',
      offer_salary: application.offer_salary?.toString() || '',
      offer_date: application.offer_date || '',
      hired_employee: application.hired_employee ? application.hired_employee.toString() : '',
      notes: application.notes || '',
    });
    setResumeFile(null);
    setShowApplicationModal(true);
  };

  const startEditIntegration = (integration: RecruitmentIntegration) => {
    setEditingIntegration(integration);
    setIntegrationForm({
      provider: integration.provider,
      display_name: integration.display_name,
      is_active: integration.is_active,
      auto_post_jobs: integration.auto_post_jobs,
      auto_sync_applicants: integration.auto_sync_applicants,
      credentials: {
        api_key: '',
        client_id: '',
        client_secret: '',
        access_token: '',
        refresh_token: '',
        company_id: '',
      },
    });
    setShowIntegrationModal(true);
  };

  const buildCredentialsPayload = () => {
    const entries = Object.entries(integrationForm.credentials)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value !== '');
    if (entries.length === 0) {
      return null;
    }
    return Object.fromEntries(entries);
  };

  const handleIntegrationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: any = {
      provider: integrationForm.provider,
      display_name: integrationForm.display_name || integrationForm.provider,
      is_active: integrationForm.is_active,
      auto_post_jobs: integrationForm.auto_post_jobs,
      auto_sync_applicants: integrationForm.auto_sync_applicants,
    };
    const credentialsPayload = buildCredentialsPayload();
    if (credentialsPayload) {
      payload.credentials = credentialsPayload;
    }

    try {
      if (editingIntegration) {
        await api.patch(`/recruitment/integrations/${editingIntegration.integration_id}/`, payload);
        toast.success('Integration updated');
      } else {
        await api.post('/recruitment/integrations/', payload);
        toast.success('Integration created');
      }
      setShowIntegrationModal(false);
      resetIntegrationForm();
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save integration');
    }
  };

  const handleDeleteIntegration = async (integrationId: number) => {
    if (!window.confirm('Delete this integration?')) {
      return;
    }
    try {
      await api.delete(`/recruitment/integrations/${integrationId}/`);
      toast.success('Integration deleted');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete integration');
    }
  };

  const handleTestIntegration = async (integration: RecruitmentIntegration) => {
    try {
      const response = await api.post(`/recruitment/integrations/${integration.integration_id}/test/`);
      toast.success(response?.data?.message || 'Integration validated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Integration test failed');
    }
  };

  const handleSyncIntegration = async (integration: RecruitmentIntegration) => {
    try {
      const response = await api.post(`/recruitment/integrations/${integration.integration_id}/sync/`);
      toast.success(response?.data?.message || 'Sync started');
      fetchIntegrations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Sync failed');
    }
  };

  const getWebhookUrl = (integration: RecruitmentIntegration) => {
    const providerSlug = integration.provider.toLowerCase();
    return `${window.location.origin}/api/v1/recruitment/webhook/${providerSlug}/?token=${integration.webhook_token}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600 mt-1">Manage job postings and applications</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'postings' && (
            <button
              onClick={() => {
                resetPostingForm();
                setShowPostingModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Job Posting
            </button>
          )}
          {activeTab === 'applications' && (
            <button
              onClick={() => {
                resetApplicationForm();
                setShowApplicationModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Application
            </button>
          )}
          {activeTab === 'integrations' && (
            <button
              onClick={() => {
                resetIntegrationForm();
                setShowIntegrationModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Integration
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('postings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'postings' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Job Postings
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'integrations' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Integrations
        </button>
      </div>

      {activeTab === 'postings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Closing Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobPostings.map((posting) => (
                  <tr key={posting.job_posting_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{posting.job_title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{posting.department_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{posting.closing_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{posting.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditPosting(posting)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePosting(posting.job_posting_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobPostings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No job postings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Interview</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.recruitment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{application.candidate_name}</div>
                      <div className="text-xs text-gray-500">{application.email}</div>
                      {application.source_provider && application.source_provider !== 'Manual' && (
                        <div className="text-xs text-gray-400">{application.source_provider}</div>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs mt-1">
                        {application.profile_url && (
                          <a
                            href={application.profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Profile
                          </a>
                        )}
                        {application.resume && (
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            Resume File
                          </a>
                        )}
                        {!application.resume && application.resume_url && (
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            Resume Link
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{application.job_title || application.job_posting}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{application.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{application.interview_date || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditApplication(application)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application.recruitment_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Integration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Auto Post</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Auto Sync</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Sync</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {integrations.map((integration) => (
                  <tr key={integration.integration_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{integration.provider}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-medium text-gray-900">{integration.display_name}</div>
                      <div className="text-xs text-gray-500 break-all">
                        Webhook: {getWebhookUrl(integration)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Credentials: {integration.has_credentials ? 'Saved' : 'Missing'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {integration.auto_post_jobs ? 'On' : 'Off'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {integration.auto_sync_applicants ? 'On' : 'Off'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{integration.last_sync_at || '-'}</div>
                      {integration.last_sync_message && (
                        <div className="text-xs text-gray-500">{integration.last_sync_message}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => startEditIntegration(integration)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTestIntegration(integration)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleSyncIntegration(integration)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Sync
                        </button>
                        <button
                          onClick={() => handleDeleteIntegration(integration.integration_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {integrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      No integrations configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPostingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPosting ? 'Edit Job Posting' : 'Add Job Posting'}
              </h2>
              <button
                onClick={() => {
                  setShowPostingModal(false);
                  resetPostingForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePostingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={postingForm.job_title}
                  onChange={(event) => setPostingForm({ ...postingForm, job_title: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={postingForm.department}
                    onChange={(event) => setPostingForm({ ...postingForm, department: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select
                    value={postingForm.employment_type}
                    onChange={(event) => setPostingForm({ ...postingForm, employment_type: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {employmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={postingForm.location}
                    onChange={(event) => setPostingForm({ ...postingForm, location: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Date</label>
                  <input
                    type="date"
                    required
                    value={postingForm.closing_date}
                    onChange={(event) => setPostingForm({ ...postingForm, closing_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Min</label>
                  <input
                    type="number"
                    step="0.01"
                    value={postingForm.salary_range_min}
                    onChange={(event) => setPostingForm({ ...postingForm, salary_range_min: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Max</label>
                  <input
                    type="number"
                    step="0.01"
                    value={postingForm.salary_range_max}
                    onChange={(event) => setPostingForm({ ...postingForm, salary_range_max: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={postingForm.status}
                    onChange={(event) => setPostingForm({ ...postingForm, status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {jobStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                  <select
                    value={postingForm.created_by}
                    onChange={(event) => setPostingForm({ ...postingForm, created_by: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={postingForm.description}
                  onChange={(event) => setPostingForm({ ...postingForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <textarea
                  required
                  value={postingForm.requirements}
                  onChange={(event) => setPostingForm({ ...postingForm, requirements: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPostingModal(false);
                    resetPostingForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingPosting ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingApplication ? 'Edit Application' : 'Add Application'}
              </h2>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  resetApplicationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleApplicationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Posting</label>
                  <select
                    required
                    value={applicationForm.job_posting}
                    onChange={(event) => setApplicationForm({ ...applicationForm, job_posting: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select job</option>
                    {jobPostings.map((posting) => (
                      <option key={posting.job_posting_id} value={posting.job_posting_id}>
                        {posting.job_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={applicationForm.status}
                    onChange={(event) => setApplicationForm({ ...applicationForm, status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {applicationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={applicationForm.candidate_name}
                    onChange={(event) => setApplicationForm({ ...applicationForm, candidate_name: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={applicationForm.email}
                    onChange={(event) => setApplicationForm({ ...applicationForm, email: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={applicationForm.phone_number}
                    onChange={(event) => setApplicationForm({ ...applicationForm, phone_number: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Date</label>
                  <input
                    type="datetime-local"
                    value={applicationForm.interview_date}
                    onChange={(event) => setApplicationForm({ ...applicationForm, interview_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile URL</label>
                  <input
                    type="url"
                    value={applicationForm.profile_url}
                    onChange={(event) => setApplicationForm({ ...applicationForm, profile_url: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume URL</label>
                  <input
                    type="url"
                    value={applicationForm.resume_url}
                    onChange={(event) => setApplicationForm({ ...applicationForm, resume_url: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {(editingApplication?.resume || editingApplication?.resume_url) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Current resume:{' '}
                    <a
                      href={editingApplication.resume || editingApplication.resume_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </a>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                <textarea
                  value={applicationForm.cover_letter}
                  onChange={(event) => setApplicationForm({ ...applicationForm, cover_letter: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Notes</label>
                <textarea
                  value={applicationForm.interview_notes}
                  onChange={(event) => setApplicationForm({ ...applicationForm, interview_notes: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Status</label>
                  <select
                    value={applicationForm.offer_status}
                    onChange={(event) => setApplicationForm({ ...applicationForm, offer_status: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select offer status</option>
                    {offerStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={applicationForm.offer_salary}
                    onChange={(event) => setApplicationForm({ ...applicationForm, offer_salary: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Date</label>
                  <input
                    type="date"
                    value={applicationForm.offer_date}
                    onChange={(event) => setApplicationForm({ ...applicationForm, offer_date: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hired Employee</label>
                  <select
                    value={applicationForm.hired_employee}
                    onChange={(event) => setApplicationForm({ ...applicationForm, hired_employee: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.full_name || `${employee.first_name} ${employee.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={applicationForm.notes}
                  onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationModal(false);
                    resetApplicationForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingApplication ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIntegrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingIntegration ? 'Edit Integration' : 'Add Integration'}
              </h2>
              <button
                onClick={() => {
                  setShowIntegrationModal(false);
                  resetIntegrationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleIntegrationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <select
                    value={integrationForm.provider}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, provider: event.target.value as RecruitmentIntegration['provider'] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {integrationProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={integrationForm.display_name}
                    onChange={(event) => setIntegrationForm({ ...integrationForm, display_name: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Main account"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={integrationForm.is_active}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, is_active: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={integrationForm.auto_post_jobs}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, auto_post_jobs: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Auto Post Jobs
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={integrationForm.auto_sync_applicants}
                    onChange={(event) =>
                      setIntegrationForm({ ...integrationForm, auto_sync_applicants: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Auto Sync Applicants
                </label>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Credentials</p>
                {editingIntegration?.has_credentials && (
                  <p className="text-xs text-gray-500">
                    Credentials already saved. Fill a field to update it.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="API Key"
                    value={integrationForm.credentials.api_key}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, api_key: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Client ID"
                    value={integrationForm.credentials.client_id}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, client_id: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Client Secret"
                    value={integrationForm.credentials.client_secret}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, client_secret: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Access Token"
                    value={integrationForm.credentials.access_token}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, access_token: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Refresh Token"
                    value={integrationForm.credentials.refresh_token}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, refresh_token: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Company ID"
                    value={integrationForm.credentials.company_id}
                    onChange={(event) =>
                      setIntegrationForm({
                        ...integrationForm,
                        credentials: { ...integrationForm.credentials, company_id: event.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowIntegrationModal(false);
                    resetIntegrationForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingIntegration ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentPage;
