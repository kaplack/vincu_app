# Vincu Backend (Auth scaffold)

## Install
```bash
cd backend
npm install
```

## Configure env
Copy `.env.example` to `.env` and edit values.

## Run (dev)
```bash
npm run dev
```

## Endpoints
- GET  /health
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me  (Authorization: Bearer <token>)
