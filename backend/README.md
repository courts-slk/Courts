# Courts Backend API

Node.js + Express + SQLite REST API for the Courts platform.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Commands

- `npm start` — Run server (dev mode with nodemon via `npm run dev`)
- `npm run seed` — Populate test data

## Environment Variables

See `.env.example` for all options:
- `PORT` — Server port (default 5000)
- `DB_PATH` — SQLite database file path
- `JWT_SECRET` — Secret for signing tokens
- `CORS_ORIGIN` — Allowed origins (comma-separated)

## API Routes

### Auth
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in (returns JWT)
- `GET /auth/me` — Current user (protected)
- `PUT /auth/me` — Update profile (protected)

### Courts
- `GET /courts` — List (queryable by city, search)
- `GET /courts/:id` — Detail
- `GET /courts/:id/slots?date=YYYY-MM-DD` — Available slots
- `POST /courts` — Create (vendor only)
- `PUT /courts/:id` — Update (vendor only)
- `DELETE /courts/:id` — Deactivate (vendor only)
- `POST /courts/:id/slots` — Add slots (vendor only)

### Vendor
- `GET /vendor/courts` — My courts
- `GET /vendor/slots` — My slots
- `PUT /vendor/slots/:slot_id/block` — Block/unblock slot
- `GET /vendor/bookings` — My bookings
- `PUT /vendor/bookings/:id/status` — Update status

### Bookings
- `POST /bookings` — Create (10-min lock)
- `GET /bookings` — Mine (protected)
- `GET /bookings/:id` — Detail (protected)
- `POST /bookings/:id/confirm` — Confirm payment (10-min window)
- `POST /bookings/:id/cancel` — Cancel with refund logic

### Admin
- `GET /admin/users` — All users
- `PUT /admin/users/:id/role` — Change role
- `GET /admin/courts` — All courts
- `PUT /admin/courts/:id/approve` — Activate/deactivate
- `GET /admin/bookings` — All bookings
- `GET /admin/stats` — Dashboard stats

## Key Files

- `src/server.js` — Express app setup
- `src/db.js` — SQLite initialization
- `src/database/schema.sql` — Table definitions
- `src/middleware/auth.js` — JWT verification
- `src/controllers/` — Business logic
- `src/routes/` — Endpoint definitions

## Background Job

Expires pending bookings every 60 seconds via `src/jobs/expireBookings.js`. Automatically cancels bookings older than 10 minutes with status `pending`.

## Database

SQLite file lives at `./courts.db` (or `DB_PATH` env var). Schema is auto-created on startup.

Run `npm run seed` to populate test data:
- Admin: admin@courts.lk / admin123
- Vendor: vendor@courts.com / vendor123
- Customer: test@courts.com / test123

## Notes

- All inputs validated server-side
- No CORS issues when deployed with frontend
- Commission calculated on-the-fly (5% of total)
- Token expiry: 7 days
