# Deploy on Render (Docker + Static Site + Postgres)

This project is **Deploy-Ready** for Render with:

- **Backend**: Django REST Framework in a **Docker Web Service** (Gunicorn + WhiteNoise)
- **Database**: Render **Postgres** (via `DATABASE_URL`)
- **Frontend**: React/Vite/Tailwind as a **Static Site**

The backend exposes a healthcheck endpoint at: `GET /health/`.

---

## 1) Create the Postgres Database

1. In Render, create a new **Postgres** instance.
2. Note:
   - `Internal Database URL` (recommended for backend)
   - `External Database URL` (optional, for local access)

You can later connect the backend service to this DB using Render's “Connect” UI, which sets `DATABASE_URL` automatically.

---

## 2) Deploy the Backend (Docker Web Service)

1. Create a **Web Service** and connect your GitHub repo.
2. Select **Docker** as the runtime.
3. Set Dockerfile path to: `backend/Dockerfile`

### Backend Environment Variables

Set these on Render:

- `SECRET_KEY` = a long random string
- `DEBUG` = `0`
- `ALLOWED_HOSTS` = `<your-backend-service>.onrender.com`
- `CORS_ALLOWED_ORIGINS` = `https://<your-frontend-site>.onrender.com`
- `CSRF_TRUSTED_ORIGINS` = `https://<your-frontend-site>.onrender.com`

Database:

- Either **attach** your Render Postgres DB to this service (recommended) or manually set:
  - `DATABASE_URL` = provided by Render Postgres

Optional Gunicorn tunables:

- `GUNICORN_WORKERS` = `2`
- `GUNICORN_TIMEOUT` = `120`

### What happens on deploy

The container entrypoint runs:

1. `python manage.py migrate --noinput`
2. `python manage.py collectstatic --noinput`
3. `gunicorn backend.wsgi:application`

---

## 3) Deploy the Frontend (Static Site)

1. Create a **Static Site** in Render.
2. Connect to the same repo.
3. Set:
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory** (if Render asks): `frontend`

### Frontend Environment Variables

- `VITE_API_URL` = `https://<your-backend-service>.onrender.com/api/v1`
- `VITE_AUTH_URL` = `https://<your-backend-service>.onrender.com`

---

## 4) Final verification

1. Open the backend healthcheck:
   - `https://<backend>.onrender.com/health/` should return `{ "status": "ok" }`
2. Open the frontend site.
3. Login with a user.
4. Smoke-test core flows:
   - HR: create KPI(s) and an Evaluation Period; activate the period
   - Manager: open **Team Reviews**, select employee + active period, score KPIs, Save
   - Employee: open **My Reviews**, open detail page and verify breakdown

---

## Common issues

### 403 CORS error

- Ensure `CORS_ALLOWED_ORIGINS` includes the frontend URL.
- Ensure frontend env `VITE_API_URL` points to the correct backend URL.

### CSRF errors

This app uses JWT Authorization header for API calls (no cookies). CSRF issues usually happen only when you access Django admin.

- Ensure `CSRF_TRUSTED_ORIGINS` includes the frontend origin.
