# Courts — Book Smarter, Play Harder

A Sri Lankan indoor sports venue booking platform. Users browse courts, pick time slots, and make bookings with a LKR 500 cash deposit.

## MVP Tech Stack

- **Frontend:** React.js (Vite) — PWA
- **Backend:** Node.js + Express
- **Database:** SQLite (local file)
- **Auth:** JWT (email/password + bcrypt)
- **File Storage:** Local `/public/uploads`
- **Hosting:** Render.com or Railway (free tier)
- **Payments:** Cash only (no online integration)

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Seed test data:
```bash
npm run seed
```

Test accounts:
- Admin: `admin@courts.lk` / `admin123`
- Vendor: `vendor@courts.com` / `vendor123`
- Customer: `test@courts.com` / `test123`

API runs on `http://localhost:5000/api`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Project Structure

```
courts/
├── backend/
│   ├── src/
│   │   ├── server.js             # Express entry
│   │   ├── db.js                 # SQLite connection
│   │   ├── middleware/           # Auth, error handling
│   │   ├── routes/               # API endpoints
│   │   ├── controllers/          # Business logic
│   │   ├── utils/                # Helpers (JWT, validators)
│   │   ├── jobs/                 # Background jobs
│   │   └── database/
│   │       └── schema.sql        # Table definitions
│   ├── public/uploads/           # Court images
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # Full page components
│   │   ├── components/           # Reusable UI components
│   │   ├── api/                  # Axios client
│   │   ├── styles/               # CSS modules
│   │   ├── utils/                # Formatters, validators
│   │   ├── App.jsx               # Router
│   │   └── main.jsx              # Entry
│   ├── public/                   # Icons, manifest
│   └── package.json
└── README.md
```

## Core Features (MVP)

### User Roles
- **Customer:** Browse courts, make bookings
- **Vendor:** Add courts, manage slots, confirm bookings
- **Admin:** Approve courts, manage users, view analytics

### Booking Flow
1. Customer selects court → browses time slots (9am–11pm in 1-hour blocks)
2. Confirms booking → status is `pending`, slot is locked for 10 minutes
3. Must pay deposit (LKR 500) within 10 min at location
4. Call `/bookings/:id/confirm` to confirm payment → status becomes `confirmed`
5. If 10 min expires: booking auto-cancels

### Cancellation & Refund
- **24+ hours before:** Full refund (LKR 500)
- **0–24 hours before:** 50% refund (LKR 250)
- **No-show or past:** No refund

### Commission
- Platform earns 5% on every confirmed booking
- Tracked in `bookings.commission_amount`

## API Highlights

### Public
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in
- `GET /courts` — List all courts (with filters)
- `GET /courts/:id` — Court details
- `GET /courts/:id/slots?date=2024-05-10` — Available slots

### Customer (Protected)
- `POST /bookings` — Create pending booking
- `GET /bookings` — My bookings
- `POST /bookings/:id/confirm` — Confirm payment
- `POST /bookings/:id/cancel` — Cancel & calculate refund

### Vendor (Protected)
- `POST /courts` — Create court
- `PUT /courts/:id` — Edit court
- `DELETE /courts/:id` — Deactivate court
- `POST /courts/:id/slots` — Add time slots (supports recurring)
- `GET /vendor/bookings` — My bookings
- `PUT /vendor/bookings/:id/status` — Confirm/complete

### Admin (Protected)
- `GET /admin/users` — All users
- `GET /admin/courts` — All courts
- `GET /admin/bookings` — All bookings
- `PUT /admin/courts/:id/approve` — Approve/reject court

## Key Design Decisions

**Slot Locking:** When a booking is created, the slot is locked via `slot_locked_until` timestamp (10 min from now). If the customer doesn't confirm within this window, a background job auto-cancels the booking every 60 seconds.

**No External APIs:** No Firebase, Stripe, or third-party auth. Everything is self-contained for MVP speed.

**SQLite Over Postgres:** Single file, zero setup, perfect for MVP testing and small deployments.

**PWA:** Mobile-first Progressive Web App. Users can "Add to Home Screen" and get a native-like experience without app stores.

## Testing Workflow

1. Register as vendor
2. Add a court with 1-hour slots (9am–5pm) for today & tomorrow
3. Register as customer
4. Browse courts, select a slot
5. Confirm booking within 10 min
6. Check "My Bookings" to see it

## Deployment

**Backend:** Deploy to Render.com or Railway
- Set environment variables (JWT_SECRET, CORS_ORIGIN)
- SQLite database persists in app directory

**Frontend:** Build React and serve from backend `/dist` folder
- `npm run build` → outputs to `dist/`
- Backend serves static files from `/` path

## What's NOT in MVP

- Loyalty points, reviews, ratings
- Team creation, group bookings
- SMS/WhatsApp notifications
- Real map integration (just shows address text)
- Online payments (cash only)
- Kandy city (schema ready, no test data)
- Service worker offline functionality (PWA manifest only)

## Future Enhancements

- Payment gateway integration (Stripe, Dialog)
- SMS reminders (Twilio)
- Real-time notifications
- Advanced reporting & analytics
- Loyalty program
- Multi-language support

---

**Built with ❤️ for Sri Lankan futsal players**
