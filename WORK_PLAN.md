# HRMS Work Plan

## Completed

### Backend
- Django project with apps for employees, payroll, leave management, attendance, performance, and recruitment
- Models, serializers, viewsets, and routes for all modules
- JWT authentication endpoints
- Admin registrations for all models

### Frontend
- React + TypeScript app (Vite) with routing and auth context
- Layout with sidebar navigation and toast notifications
- Pages implemented: Login, Dashboard, Employees
- API integration in place for auth, dashboard stats, employees, and departments
- Placeholder UI routes for leave, attendance, payroll, performance, and recruitment

## To Do (Start Working Checklist)

### Environment + Setup
- Create backend `.env` with `SECRET_KEY` and `DEBUG`
- Optional: create `frontend/.env` with `VITE_API_URL`
- Install backend deps and run migrations
- Install frontend deps
- Start backend and frontend dev servers
- Create a superuser and verify login

### Verify Base Flow
- Login -> dashboard loads stats
- Employees page can list, create, edit, delete employees
- Departments can be created and edited

## Next Work Items (Priority)

### Backend Enhancements
- Role-based access control and custom permissions
- File uploads for documents/resumes
- Email notifications
- API documentation (Swagger/OpenAPI)
- Unit tests and test data factories
- Pagination tuning and better filters/search

### Frontend Enhancements
- Employee detail view
- Form validation and error handling improvements
- Loading states and empty states for all modules
- Data export functionality
- Charts and analytics
- Mobile responsiveness improvements

### Module Implementation (UI + API Wiring)
- Leave Management screens (requests, balances, approvals)
- Attendance screens (clock in/out, shifts)
- Payroll screens (pay runs, payslip generation)
- Performance screens (reviews, goals)
- Recruitment screens (job postings, applications)
