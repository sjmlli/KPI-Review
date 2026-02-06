import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';
import type { EmailSettings, OfferLetterTemplate, Role } from '../types';

type SettingsTab = 'smtp' | 'offer-template' | 'roles';

const defaultOfferBody =
  'Dear {employee_name},\n\nWe are pleased to offer you the position of {designation} at {company_name}. Your expected joining date is {joining_date}.\n\nYour annual CTC will be {ctc}. You will be on probation for {probation_period}. Your reporting manager will be {reporting_manager}.\n\nWork location: {work_location}\nShift timings: {shift_timings}\nBenefits: {benefits}\n\nPlease sign and return this letter as acceptance of this offer.';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('smtp');
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [template, setTemplate] = useState<OfferLetterTemplate | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const [smtpForm, setSmtpForm] = useState({
    display_name: 'Default SMTP',
    from_email: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    use_tls: true,
    use_ssl: false,
    is_active: true,
  });

  const [templateForm, setTemplateForm] = useState({
    name: 'Default Template',
    company_name: '',
    company_address: '',
    subject: 'Offer Letter',
    body: defaultOfferBody,
    footer: '',
    is_active: true,
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    portal: 'Admin' as Role['portal'],
    permissions: [] as string[],
  });

  const permissionGroups = [
    {
      label: 'Full Access',
      options: ['*'],
    },
    {
      label: 'Portal Access',
      options: ['portal.admin', 'portal.employee'],
    },
    {
      label: 'Employees',
      options: ['employees.view', 'employees.manage', 'employees.view_salary', 'employees.view_bank'],
    },
    {
      label: 'Organization',
      options: ['org_chart.view'],
    },
    {
      label: 'Onboarding',
      options: ['onboarding.view', 'onboarding.manage', 'onboarding.self'],
    },
    {
      label: 'Assets',
      options: ['assets.view', 'assets.manage', 'assets.self'],
    },
    {
      label: 'Policies',
      options: ['policies.view', 'policies.manage', 'policies.self'],
    },
    {
      label: 'Leave',
      options: ['leave.view', 'leave.manage', 'leave.self'],
    },
    {
      label: 'Attendance',
      options: ['attendance.view', 'attendance.manage', 'attendance.self'],
    },
    {
      label: 'Timesheets & Overtime',
      options: [
        'timesheet.view',
        'timesheet.manage',
        'timesheet.self',
        'overtime.view',
        'overtime.manage',
        'overtime.self',
      ],
    },
    {
      label: 'Payroll',
      options: [
        'payroll.view',
        'payroll.manage',
        'payroll.self',
        'claims.view',
        'claims.manage',
        'claims.self',
      ],
    },
    {
      label: 'Performance',
      options: ['performance.view', 'performance.manage'],
    },
    {
      label: 'Recruitment',
      options: ['recruitment.view', 'recruitment.manage'],
    },
    {
      label: 'Settings',
      options: ['settings.view', 'settings.manage'],
    },
    {
      label: 'Offer Letters',
      options: ['offer_letters.view', 'offer_letters.manage'],
    },
    {
      label: 'Roles',
      options: ['roles.manage'],
    },
  ];

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [smtpRes, templateRes, rolesRes] = await Promise.all([
        api.get('/employees/email-settings/'),
        api.get('/employees/offer-letter-templates/'),
        api.get('/employees/roles/'),
      ]);
      const smtpList = smtpRes.data.results || smtpRes.data || [];
      const templateList = templateRes.data.results || templateRes.data || [];
      const roleList = rolesRes.data.results || rolesRes.data || [];
      const smtpItem = smtpList[0] || null;
      const templateItem = templateList[0] || null;

      if (smtpItem) {
        setEmailSettings(smtpItem);
        setSmtpForm({
          display_name: smtpItem.display_name,
          from_email: smtpItem.from_email,
          smtp_host: smtpItem.smtp_host,
          smtp_port: smtpItem.smtp_port?.toString() || '587',
          smtp_username: smtpItem.smtp_username || '',
          smtp_password: '',
          use_tls: smtpItem.use_tls,
          use_ssl: smtpItem.use_ssl,
          is_active: smtpItem.is_active,
        });
      }
      if (templateItem) {
        setTemplate(templateItem);
        setTemplateForm({
          name: templateItem.name,
          company_name: templateItem.company_name,
          company_address: templateItem.company_address || '',
          subject: templateItem.subject,
          body: templateItem.body,
          footer: templateItem.footer || '',
          is_active: templateItem.is_active,
        });
      }
      setRoles(roleList);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSmtpSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: any = {
      display_name: smtpForm.display_name,
      from_email: smtpForm.from_email,
      smtp_host: smtpForm.smtp_host,
      smtp_port: parseInt(smtpForm.smtp_port, 10),
      smtp_username: smtpForm.smtp_username || null,
      use_tls: smtpForm.use_tls,
      use_ssl: smtpForm.use_ssl,
      is_active: smtpForm.is_active,
    };
    if (smtpForm.smtp_password) {
      payload.smtp_password = smtpForm.smtp_password;
    }

    try {
      if (emailSettings) {
        await api.patch(`/employees/email-settings/${emailSettings.settings_id}/`, payload);
        toast.success('SMTP settings updated');
      } else {
        await api.post('/employees/email-settings/', payload);
        toast.success('SMTP settings saved');
      }
      loadSettings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save SMTP settings');
    }
  };

  const handleTemplateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: templateForm.name,
      company_name: templateForm.company_name,
      company_address: templateForm.company_address || null,
      subject: templateForm.subject,
      body: templateForm.body,
      footer: templateForm.footer || null,
      is_active: templateForm.is_active,
    };

    try {
      if (template) {
        await api.patch(`/employees/offer-letter-templates/${template.template_id}/`, payload);
        toast.success('Offer letter template updated');
      } else {
        await api.post('/employees/offer-letter-templates/', payload);
        toast.success('Offer letter template saved');
      }
      loadSettings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save template');
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      portal: 'Admin',
      permissions: [],
    });
    setEditingRole(null);
  };

  const handleRoleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: roleForm.name,
      description: roleForm.description || null,
      portal: roleForm.portal,
      permissions: roleForm.permissions,
    };
    try {
      if (editingRole) {
        await api.patch(`/employees/roles/${editingRole.role_id}/`, payload);
        toast.success('Role updated');
      } else {
        await api.post('/employees/roles/', payload);
        toast.success('Role created');
      }
      resetRoleForm();
      loadSettings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save role');
    }
  };

  const togglePermission = (permission: string, checked: boolean) => {
    if (checked) {
      if (permission === '*') {
        setRoleForm({ ...roleForm, permissions: ['*'] });
        return;
      }
      const next = roleForm.permissions.filter((item) => item !== '*');
      if (!next.includes(permission)) {
        next.push(permission);
      }
      setRoleForm({ ...roleForm, permissions: next });
      return;
    }

    if (permission === '*') {
      setRoleForm({ ...roleForm, permissions: roleForm.permissions.filter((item) => item !== '*') });
      return;
    }
    setRoleForm({
      ...roleForm,
      permissions: roleForm.permissions.filter((item) => item !== permission),
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      portal: role.portal,
      permissions: role.permissions || [],
    });
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      toast.error('System roles cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete role "${role.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/employees/roles/${role.role_id}/`);
      toast.success('Role deleted');
      loadSettings();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure SMTP and offer letter templates</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'smtp' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          SMTP Settings
        </button>
        <button
          onClick={() => setActiveTab('offer-template')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'offer-template' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Offer Letter Template
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'roles' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          Roles
        </button>
      </div>

      {activeTab === 'smtp' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSmtpSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={smtpForm.display_name}
                  onChange={(event) => setSmtpForm({ ...smtpForm, display_name: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <input
                  type="email"
                  required
                  value={smtpForm.from_email}
                  onChange={(event) => setSmtpForm({ ...smtpForm, from_email: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                <input
                  type="text"
                  required
                  value={smtpForm.smtp_host}
                  onChange={(event) => setSmtpForm({ ...smtpForm, smtp_host: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                <input
                  type="number"
                  required
                  value={smtpForm.smtp_port}
                  onChange={(event) => setSmtpForm({ ...smtpForm, smtp_port: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={smtpForm.smtp_username}
                  onChange={(event) => setSmtpForm({ ...smtpForm, smtp_username: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={smtpForm.smtp_password}
                  onChange={(event) => setSmtpForm({ ...smtpForm, smtp_password: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={emailSettings ? 'Leave blank to keep existing password' : ''}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={smtpForm.use_tls}
                    onChange={(event) => setSmtpForm({ ...smtpForm, use_tls: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Use TLS
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={smtpForm.use_ssl}
                    onChange={(event) => setSmtpForm({ ...smtpForm, use_ssl: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Use SSL
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Save SMTP Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'offer-template' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={templateForm.company_name}
                  onChange={(event) => setTemplateForm({ ...templateForm, company_name: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
              <textarea
                value={templateForm.company_address}
                onChange={(event) => setTemplateForm({ ...templateForm, company_address: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={templateForm.subject}
                onChange={(event) => setTemplateForm({ ...templateForm, subject: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
              <textarea
                required
                value={templateForm.body}
                onChange={(event) => setTemplateForm({ ...templateForm, body: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-2">
                Available placeholders: {`{employee_name}, {designation}, {company_name}, {joining_date}, {ctc}, {probation_period}, {reporting_manager}, {work_location}, {shift_timings}, {benefits}`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer</label>
              <textarea
                value={templateForm.footer}
                onChange={(event) => setTemplateForm({ ...templateForm, footer: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRole ? 'Edit Role' : 'Create Role'}
            </h2>
            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    disabled={editingRole?.is_system}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portal</label>
                  <select
                    value={roleForm.portal}
                    onChange={(event) =>
                      setRoleForm({ ...roleForm, portal: event.target.value as Role['portal'] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Admin">Admin Portal</option>
                    <option value="Employee">Employee Portal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Permissions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissionGroups.map((group) => (
                    <div key={group.label} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">{group.label}</p>
                      <div className="space-y-2">
                        {group.options.map((permission) => (
                          <label key={permission} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={roleForm.permissions.includes(permission)}
                              onChange={(event) => togglePermission(permission, event.target.checked)}
                              className="h-4 w-4"
                            />
                            {permission}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                {editingRole && (
                  <button
                    type="button"
                    onClick={resetRoleForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Roles</h2>
            {roles.length === 0 ? (
              <p className="text-sm text-gray-500">No roles available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.role_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{role.portal} portal</p>
                        {role.description && <p className="text-sm text-gray-600 mt-2">{role.description}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                          Permissions: {role.permissions?.length || 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Edit
                        </button>
                        {!role.is_system && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
