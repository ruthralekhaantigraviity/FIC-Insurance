# FIC Insurance CRM

Full-stack insurance sales and lead management CRM built with React, Node.js, Express, and MongoDB.

## Features
- Admin and Employee role-based access
- JWT authentication
- Lead pipeline management
- Employee management and performance reporting
- Task assignment and announcements
- Payment link generation and policy issuance flow
- Incentive slab support and reporting
- CSV import and Excel export for leads

## Setup

1. Copy the backend environment example:

```bash
cd backend
copy .env.example .env
```

2. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Start MongoDB locally or update `MONGO_URI` in `backend/.env`.

4. Run backend server:

```bash
cd backend
npm run dev
```

5. Run frontend app:

```bash
cd frontend
npm run dev
```

6. Seed sample data:

```bash
curl -X POST http://localhost:5000/api/seed
```

## Default demo accounts

- Admin: `admin@fic.com` / `Password123`
- Employee: `agent@fic.com` / `Password123`

## Notes

- Frontend runs on `http://localhost:4173`
- Backend runs on `http://localhost:5000`
- API proxy is configured in `frontend/vite.config.js`

## Deployment

### Backend on Render

1. Go to [Render](https://render.com/) and create a new **Web Service** from this GitHub repo.
2. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add environment variables:
   - `MONGO_URI` (or `MONGODB_URI`) = your MongoDB connection string
   - `JWT_SECRET` = a long secure secret
4. Deploy and copy your backend URL (example: `https://fic-backend.onrender.com`).

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com/) and import the same GitHub repo.
2. Configure project:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-render-backend.onrender.com/api`
4. Deploy.
