# HRMS Platform + Performance Evaluation System

This repo contains a Human Resource Management System built with:

- **Backend**: Django + Django REST Framework (JWT auth)
- **Frontend**: React (Vite) + Tailwind

It also includes a complete **Performance Evaluation System** with configurable KPIs, evaluation periods, and weighted scoring.

## Features

- Employee Management
- Payroll Management
- Leave Management
- Attendance Tracking
- Performance Evaluation (KPI-based, weighted average)
- Recruitment & Onboarding
- Employee Self-Service Portal
- Reporting & Analytics

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- React
- Modern UI/UX

## Project Structure

```
HRMS/
├── backend/          # Django backend
├── frontend/         # React frontend
├── requirements.txt  # Python dependencies
└── README.md
```

## Setup (Local Development)

### Backend

1. Create and activate virtual environment:
```bash
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# Linux/Mac
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create an env file:

```bash
cp backend/.env.example .env
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run server:
```bash
python manage.py runserver
```

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create an env file:

```bash
cp frontend/.env.example frontend/.env
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Docker (One Command)

Make sure you create a `.env` in the project root on the server (see example below).

Example `.env` (adjust IP/domain):
```env
SECRET_KEY=change-me
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1,SERVER_IP_OR_DOMAIN
CORS_ALLOWED_ORIGINS=http://SERVER_IP_OR_DOMAIN:3000
VITE_API_URL=http://SERVER_IP_OR_DOMAIN:8000/api/v1
VITE_AUTH_URL=http://SERVER_IP_OR_DOMAIN:8000
```

1. Build and start:
```bash
docker compose up --build
```

2. Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/

Optional (first-time admin user):
```bash
docker compose exec backend python manage.py createsuperuser
```

## API Documentation

API endpoints are available at `/api/v1/` when the backend server is running.

### Performance Evaluation API

- `GET /api/v1/performance/kpis/` (read for authenticated; **write: HR only**)
- `GET /api/v1/performance/periods/` (read for authenticated; **write: HR only**)
- `POST /api/v1/performance/periods/<id>/activate/` (HR)
- `POST /api/v1/performance/periods/<id>/close/` (HR)
- `GET/POST/PATCH /api/v1/performance/reviews/` (team/self filtered)

Scoring:

`total_score = sum(score * weight) / sum(weight)` with safe handling when sum(weight)=0.

## Deploy

See **DEPLOY_RENDER.md** for Render (Docker Web Service + Static Site + Postgres).

## License

MIT

