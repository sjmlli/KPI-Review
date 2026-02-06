export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthContextType {
  user: User | null;
  employeeProfile: Employee | null;
  isAuthenticated: boolean;
  loading: boolean;
  role: string | null;
  portal: 'Admin' | 'Employee' | null;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; role?: string | null; portal?: 'Admin' | 'Employee' | null }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone_number?: string;
  department: number | null;
  department_name?: string;
  designation: string;
  role?: string;
  role_portal?: 'Admin' | 'Employee';
  role_permissions?: string[];
  managers?: number[];
  managers_details?: {
    employee_id: number;
    full_name: string;
    email: string;
    designation: string;
  }[];
  team_lead?: number | null;
  team_lead_name?: string;
  direct_reports_count?: number;
  date_of_birth?: string;
  hire_date: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  salary?: number;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_account_number?: string;
  bank_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  department_id: number;
  name: string;
  description?: string;
  manager?: number;
  manager_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  leave_id: number;
  employee: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
  approved_by?: number | null;
  approved_by_name?: string;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveBalance {
  balance_id: number;
  employee: number;
  employee_name?: string;
  leave_type: string;
  balance: number;
  used: number;
  available?: number;
  year: number;
  created_at?: string;
  updated_at?: string;
}

export interface Holiday {
  holiday_id: number;
  name: string;
  date: string;
  is_active: boolean;
  description?: string | null;
  created_at?: string;
}

export interface Attendance {
  attendance_id: number;
  employee: number;
  employee_name?: string;
  date: string;
  clock_in_time?: string | null;
  clock_out_time?: string | null;
  working_hours?: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Timesheet {
  timesheet_id: number;
  employee: number;
  employee_name?: string;
  date: string;
  clock_in_time?: string | null;
  clock_out_time?: string | null;
  working_hours?: number;
  overtime_hours?: number;
  status: 'Open' | 'Submitted' | 'Approved' | 'Rejected';
  source: 'Attendance' | 'Biometric' | 'Manual';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OvertimeRequest {
  overtime_id: number;
  employee: number;
  employee_name?: string;
  timesheet?: number | null;
  timesheet_date?: string;
  date: string;
  hours: number;
  reason?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: number | null;
  approved_by_name?: string;
  approved_at?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  shift_id: number;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeShift {
  id: number;
  employee: number;
  employee_name?: string;
  shift: number;
  shift_name?: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Payroll {
  payroll_id: number;
  employee: number;
  employee_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  allowances: number;
  bonus: number;
  overtime_pay: number;
  deductions: number;
  tax: number;
  insurance: number;
  net_pay: number;
  status: 'Paid' | 'Unpaid' | 'Pending';
  payslip_generated?: boolean;
  payslip_file?: string | null;
  payment_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalaryStructure {
  structure_id: number;
  employee: number;
  employee_name?: string;
  basic_salary: number;
  house_rent_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  provident_fund_percentage: number;
  tax_percentage: number;
  total_salary?: number;
  effective_from: string;
  effective_to?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseClaim {
  claim_id: number;
  employee: number;
  employee_name?: string;
  category: 'Travel' | 'Meal' | 'Office' | 'Training' | 'Other';
  amount: number;
  currency: string;
  expense_date: string;
  description?: string | null;
  receipt?: string | null;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  approved_by?: number | null;
  approved_by_name?: string;
  approved_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type KPICategory = 'GENERAL' | 'JOB_SPECIFIC' | 'STRATEGIC';

export interface KPI {
  kpi_id: number;
  title: string;
  category: KPICategory;
  weight: string | number;
  description?: string | null;
  is_active: boolean;
  related_department?: number | null;
  related_role?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type EvaluationPeriodType = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type EvaluationPeriodStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface EvaluationPeriod {
  period_id: number;
  name: string;
  period_type: EvaluationPeriodType;
  start_date: string;
  end_date: string;
  status: EvaluationPeriodStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceReviewItem {
  item_id: number;
  review?: number;
  kpi: number;
  kpi_title?: string;
  kpi_category?: KPICategory;
  kpi_weight?: string;
  score: number;
  comment?: string | null;
  weighted_score?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceReview {
  review_id: number;
  employee: number;
  employee_name?: string;
  manager?: number | null;
  manager_name?: string;
  period: number;
  period_detail?: EvaluationPeriod;
  total_score?: string;
  final_comment?: string | null;
  items?: PerformanceReviewItem[];
  created_at?: string;
  updated_at?: string;
}

export interface JobPosting {
  job_posting_id: number;
  job_title: string;
  department: number | null;
  department_name?: string;
  description: string;
  requirements: string;
  location?: string | null;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary_range_min?: number | null;
  salary_range_max?: number | null;
  posted_date: string;
  closing_date: string;
  status: 'Open' | 'Closed' | 'Draft';
  created_by?: number | null;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecruitmentApplication {
  recruitment_id: number;
  job_posting: number;
  job_title?: string;
  department_name?: string;
  candidate_name: string;
  email: string;
  phone_number?: string | null;
  resume?: string | null;
  resume_url?: string | null;
  profile_url?: string | null;
  source_provider?: 'Manual' | 'LinkedIn' | 'Naukri';
  external_id?: string | null;
  cover_letter?: string | null;
  status: 'Applied' | 'Screening' | 'Interviewed' | 'Shortlisted' | 'Hired' | 'Rejected' | 'Withdrawn';
  interview_date?: string | null;
  interview_notes?: string | null;
  offer_status?: 'Pending' | 'Offered' | 'Accepted' | 'Rejected' | null;
  offer_salary?: number | null;
  offer_date?: string | null;
  hired_employee?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecruitmentIntegration {
  integration_id: number;
  provider: 'LinkedIn' | 'Naukri';
  display_name: string;
  is_active: boolean;
  auto_post_jobs: boolean;
  auto_sync_applicants: boolean;
  has_credentials: boolean;
  webhook_token: string;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmailSettings {
  settings_id: number;
  display_name: string;
  from_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username?: string | null;
  use_tls: boolean;
  use_ssl: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OfferLetterTemplate {
  template_id: number;
  name: string;
  company_name: string;
  company_address?: string | null;
  company_logo?: string | null;
  subject: string;
  body: string;
  footer?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OfferLetter {
  offer_letter_id: number;
  employee: number;
  employee_name?: string;
  joining_date: string;
  ctc: number;
  designation: string;
  probation_period: string;
  reporting_manager?: number | null;
  reporting_manager_name?: string;
  work_location: string;
  benefits?: string | null;
  shift_timings?: string | null;
  template?: number | null;
  template_name?: string;
  pdf_file?: string | null;
  issued_by?: number | null;
  issued_at?: string;
  updated_at?: string;
}

export interface Role {
  role_id: number;
  name: string;
  description?: string | null;
  portal: 'Admin' | 'Employee';
  permissions: string[];
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BiometricIntegration {
  integration_id: number;
  provider: 'ZKTeco' | 'eSSL' | 'BioStar' | 'Suprema' | 'Generic';
  display_name: string;
  connection_type: 'Webhook' | 'Polling';
  base_url?: string | null;
  device_id?: string | null;
  data_mapping?: Record<string, any> | null;
  webhook_token: string;
  is_active: boolean;
  auto_sync: boolean;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BiometricPunch {
  punch_id: number;
  integration: number;
  employee?: number | null;
  employee_name?: string;
  employee_identifier?: string | null;
  device_id?: string | null;
  punch_time: string;
  direction?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  totalDepartments: number;
}

export interface OnboardingChecklistTemplate {
  template_id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingTaskTemplate {
  task_template_id: number;
  checklist: number;
  checklist_name?: string;
  title: string;
  description?: string | null;
  assigned_to: 'HR' | 'Employee';
  due_offset_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingTask {
  task_id: number;
  employee: number;
  employee_name?: string;
  template?: number | null;
  template_title?: string;
  title: string;
  description?: string | null;
  assigned_to: 'HR' | 'Employee';
  due_date?: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDocument {
  document_id: number;
  employee: number;
  employee_name?: string;
  doc_type: 'ID' | 'Bank' | 'Tax' | 'Contract' | 'Other';
  title: string;
  file: string;
  uploaded_by?: number | null;
  uploaded_by_name?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  asset_id: number;
  asset_type: 'Laptop' | 'Phone' | 'AccessCard' | 'Monitor' | 'Other';
  asset_tag: string;
  serial_number?: string | null;
  model?: string | null;
  status: 'Available' | 'Assigned' | 'Repair' | 'Retired';
  purchase_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssetAssignment {
  assignment_id: number;
  asset: number;
  asset_tag?: string;
  employee: number;
  employee_name?: string;
  assigned_by?: number | null;
  assigned_by_name?: string;
  assigned_at?: string;
  returned_at?: string | null;
  return_condition?: string | null;
  notes?: string | null;
}

export interface Policy {
  policy_id: number;
  title: string;
  content: string;
  version: string;
  effective_date: string;
  is_active: boolean;
  require_ack: boolean;
  created_by?: number | null;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PolicyAcknowledgment {
  acknowledgment_id: number;
  policy: number;
  policy_title?: string;
  employee: number;
  employee_name?: string;
  status: 'Acknowledged' | 'Declined';
  comment?: string | null;
  acknowledged_at?: string;
  created_at?: string;
}
