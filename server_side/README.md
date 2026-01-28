# EventHub Backend (MERN)

Minimal Express + MongoDB backend scaffold matching the frontend.

Quick start

1. copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. from `server_side` run:

```bash
npm install
npm run dev
```

APIs
- `POST /api/auth/register` { name, email, password, role }
- `POST /api/auth/login` { email, password }
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events` (protected)
- `POST /api/bookings` (protected) { eventId, tickets }
- `GET /api/bookings/me` (protected)
