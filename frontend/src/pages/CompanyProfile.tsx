import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const CompanyProfile: React.FC = () => {
  const modules = [
    { title: 'Employee Core', detail: 'Profiles, departments, managers, custom roles.' },
    { title: 'Onboarding', detail: 'Checklists, documents, and offer letters.' },
    { title: 'Attendance', detail: 'Shifts, biometric punches, daily timesheets.' },
    { title: 'Leave', detail: 'Balances, approvals, manager workflows.' },
    { title: 'Payroll', detail: 'Salary structures, payslips, reimbursements.' },
    { title: 'Performance', detail: 'Reviews, goals, and feedback cycles.' },
    { title: 'Assets', detail: 'Assignments, handover history, inventory.' },
    { title: 'Policies', detail: 'Acknowledgments with visibility tracking.' },
    { title: 'Recruitment', detail: 'Postings, candidates, integration hubs.' },
  ];

  const differentiators = [
    {
      title: 'Single source of truth',
      body: 'One employee record fuels onboarding, leave, payroll, and analytics without double entry.',
    },
    {
      title: 'Manager-ready approvals',
      body: 'Managers can approve leave and overtime in one click with full context and audit trails.',
    },
    {
      title: 'Configurable by company',
      body: 'Custom roles, templates, and integrations keep every deployment aligned to policy.',
    },
  ];

  const promises = [
    {
      title: 'Clarity over chaos',
      body: 'Every team sees what they need, nothing they do not. Roles, permissions, and portals keep data clean.',
    },
    {
      title: 'Built for daily ops',
      body: 'Attendance, leave, and payroll flow together with automatic timesheets and approval trails.',
    },
    {
      title: 'Ready for scale',
      body: 'From onboarding to exits, every step is documented and measured so you can grow with confidence.',
    },
  ];

  const highlights = [
    { label: 'Focus', value: 'People operations, payroll, compliance' },
    { label: 'Delivery', value: 'Web-first with mobile-ready workflows' },
    { label: 'Deployment', value: 'Cloud or on-premises' },
    { label: 'Support', value: 'Guided onboarding and live assistance' },
  ];

  const valueCards = [
    {
      label: 'Onboarding that feels premium',
      value: 'Offer letters, document collection, and checklists in one flow.',
    },
    {
      label: 'Approvals you can trust',
      value: 'Managers see context and audit trails for every request.',
    },
    {
      label: 'Payroll-ready data',
      value: 'Attendance and overtime feed payroll without manual spreadsheets.',
    },
    {
      label: 'Employee self-service',
      value: 'Clear profiles, leave tracking, and personal dashboards.',
    },
  ];

  const trustMarks = [
    'Role-based access',
    'Audit trails',
    'Data encryption',
    'Custom retention rules',
  ];

  const testimonials = [
    {
      quote:
        'Sundial keeps our HR, payroll, and attendance in one place without the usual overhead.',
      name: 'People Operations Lead',
      company: 'Growing technology company',
    },
    {
      quote:
        'Managers get the visibility they need and employees know exactly where they stand.',
      name: 'HR Director',
      company: 'Multi-location enterprise',
    },
    {
      quote:
        'Onboarding feels polished for candidates and effortless for HR teams.',
      name: 'Talent Lead',
      company: 'Creative services firm',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute -top-24 -left-16 h-80 w-80 rounded-full blur-3xl"
            style={{ background: 'rgba(15, 118, 110, 0.25)' }}
          />
          <div
            className="absolute top-24 right-[-80px] h-72 w-72 rounded-full blur-3xl"
            style={{ background: 'rgba(234, 179, 8, 0.2)' }}
          />
        </div>

        <div className="relative">
          <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                S
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Company Profile</p>
              <h1 className="text-xl font-bold text-gray-900">Sundial HRMS</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <a href="#story" className="hover:text-indigo-600">Story</a>
                <a href="#modules" className="hover:text-indigo-600">Platform</a>
                <a href="#impact" className="hover:text-indigo-600">Impact</a>
                <a href="#contact" className="hover:text-indigo-600">Contact</a>
              </nav>
              <Link
                to="/login"
                className="hidden sm:inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:border-gray-300"
              >
                Login
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-6 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                A modern HR platform
              </p>
              <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
                Sundial HRMS keeps people operations on time, every day.
              </h2>
              <p className="text-lg text-gray-600">
                We design a calm, connected HR workspace where onboarding, attendance, payroll,
                and performance move in one rhythm. Every module feels familiar, every report is
                instantly clear, and every employee knows where they stand.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300"
                >
                  Login
                </Link>
                <a
                  href="#contact"
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
                >
                  Book a demo
                </a>
                <a
                  href="#modules"
                  className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300"
                >
                  Explore the platform
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6">
                {highlights.map((item) => (
                  <div key={item.label} className="app-panel rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {valueCards.map((item) => (
                  <div key={item.label} className="app-panel rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="app-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Signature line</p>
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">
                  Align people, policy, and payroll in one smart canvas.
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  Sundial HRMS blends automation with human oversight so managers stay in control
                  while teams move fast.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="app-panel rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Speed</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">Setup in weeks, not months.</p>
                </div>
                <div className="app-panel rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Care</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">Employee experience at the core.</p>
                </div>
                <div className="app-panel rounded-2xl p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Visibility</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    Real-time dashboards for headcount, leave trends, and payroll readiness.
                  </p>
                </div>
              </div>
              <div className="app-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trust built in</p>
                <div className="mt-4 grid gap-3 text-sm text-gray-600">
                  {trustMarks.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section id="story" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Our story</p>
            <h3 className="text-3xl font-bold text-gray-900">
              Built for modern HR teams who need focus, not friction.
            </h3>
            <p className="text-gray-600">
              Sundial HRMS started with a simple idea: HR should feel like a calm control room,
              not a maze. We created a platform that brings every workflow into one clear timeline,
              so HR leaders can guide culture while managers move faster and employees feel seen.
            </p>
          </div>
          <div className="app-panel rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Company profile</p>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Headquarters</span>
                <span className="font-medium text-gray-900">Remote-first</span>
              </div>
              <div className="flex justify-between">
                <span>Primary markets</span>
                <span className="font-medium text-gray-900">India and SEA</span>
              </div>
              <div className="flex justify-between">
                <span>Customer size</span>
                <span className="font-medium text-gray-900">50 to 5,000 employees</span>
              </div>
              <div className="flex justify-between">
                <span>Core promise</span>
                <span className="font-medium text-gray-900">One portal, total clarity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">The platform</p>
            <h3 className="text-3xl font-bold text-gray-900">Everything HR needs, in one rhythm.</h3>
          </div>
          <p className="max-w-md text-gray-600">
            Each module is designed to feel consistent, fast, and reliable with a shared data core.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div key={module.title} className="app-panel rounded-2xl p-5">
              <h4 className="text-lg font-semibold text-gray-900">{module.title}</h4>
              <p className="mt-2 text-sm text-gray-600">{module.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Why teams switch</p>
            <h3 className="text-3xl font-bold text-gray-900">Designed to feel premium and dependable.</h3>
          </div>
          <p className="max-w-md text-gray-600">
            From day-one setup to monthly payroll, Sundial keeps operations smooth without the clutter.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {differentiators.map((item) => (
            <div key={item.title} className="app-panel rounded-3xl p-6">
              <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
              <p className="mt-3 text-sm text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="impact" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {promises.map((item) => (
            <div key={item.title} className="app-panel rounded-3xl p-6">
              <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
              <p className="mt-3 text-sm text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="app-panel rounded-3xl p-6">
              <p className="text-sm text-gray-600">"{item.quote}"</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="app-panel rounded-3xl p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Implementation</p>
              <h3 className="text-3xl font-bold text-gray-900">Launch with confidence.</h3>
              <p className="mt-3 text-gray-600">
                Our onboarding team helps you map policies, configure roles, and connect payroll
                so you can go live in weeks with clean data and trained managers.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  1
                </span>
                <span>Discovery and data import</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  2
                </span>
                <span>Workflow and permission setup</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  3
                </span>
                <span>Go-live with guided training</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Contact</p>
            <h3 className="text-3xl font-bold text-gray-900">Ready to bring calm to HR?</h3>
            <p className="text-gray-600">
              Tell us about your company and we will craft a rollout plan that fits your timelines,
              permissions, and payroll requirements.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:hello@sundialhrms.com?subject=Schedule%20a%20demo"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
              >
                Schedule a demo
              </a>
              <a
                href="/brochure.html"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300"
              >
                View brochure
              </a>
            </div>
          </div>
          <div className="app-panel rounded-3xl p-6 space-y-4 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">hello@sundialhrms.com</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Phone</p>
              <p className="font-semibold text-gray-900">+91 00000 00000</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Office</p>
              <p className="font-semibold text-gray-900">Remote-first, global support</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tagline</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                Time becomes your advantage with Sundial HRMS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyProfile;
