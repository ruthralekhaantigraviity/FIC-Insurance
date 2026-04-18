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
npm install
cd frontend && npm install
```

3. Start MongoDB locally or update `MONGO_URI` in `backend/.env`.

4. Run both servers from the root:

```bash
npm start
```

5. Seed sample data:

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
