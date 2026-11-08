# Courts Application Documentation

**Document status:** Implementation audit and team handoff
**Reviewed:** 2026-09-26
**Product:** Courts - Sri Lankan indoor sports venue booking platform

## 1. Executive Summary

Courts is a mobile-first web application for discovering and booking indoor sports courts, initially focused on futsal venues in Sri Lanka. The platform supports three user roles:

- **Customer:** discovers courts, selects an available time slot, creates a booking, confirms the cash deposit, and manages cancellations.
- **Vendor:** manages courts and availability, reviews bookings, blocks slots, and updates booking status.
- **Administrator:** manages users, controls court activation, reviews all bookings, and views operational statistics.

The current implementation is an MVP. The central booking journey is wired end to end against a REST API and SQLite database. Loyalty, reviews, online payments, notifications, and several analytics screens are either not implemented or currently display static UI data.

The codebase is a two-package repository:

```text
Courts/
├── backend/    Express API, SQLite persistence, authentication, jobs, uploads
├── frontend/   React/Vite PWA and role-based application UI
├── docs/       Team documentation
└── README.md
```

## 2. Product Scope and Use Cases

### 2.1 Customer use cases

1. Register with a name, email, phone number, and password.
2. Sign in and maintain an authenticated session using a JWT.
3. Browse active courts and filter by city or search text.
4. Inspect a court's address, description, surface, pitch size, price, and images.
5. Select a date and an available hourly slot.
6. Create a booking using the cash-on-location payment method.
7. Hold a selected slot for 10 minutes while payment is confirmed.
8. Confirm the booking and receive a booking reference.
9. View upcoming, past, and cancelled bookings.
10. Cancel an eligible booking and receive a calculated refund amount.
11. Update profile information and log out.
12. View the planned loyalty experience; the current page is presentation-only.

### 2.2 Vendor use cases

1. Sign in as a vendor.
2. View a dashboard summary for courts, today's bookings, and revenue.
3. Create, edit, deactivate, and view owned courts.
4. Upload court images.
5. Generate availability slots for a court, including recurring slot input supported by the backend.
6. Inspect slots by court and date.
7. Block or unblock an individual slot.
8. View bookings associated with owned courts.
9. Update booking status, including confirmation and later lifecycle states supported by the API.
10. View the vendor analytics screen; the current charts and metrics are static values.

### 2.3 Administrator use cases

1. View platform statistics: users, active courts, today's bookings, confirmed revenue, and recent bookings.
2. View all users and change a user's role.
3. View all courts and activate or deactivate them.
4. View all bookings across the platform.
5. Use the revenue screen; it is currently a static presentation and is not connected to an API.

### 2.4 Current business rules

- Only active courts can be booked.
- A slot must belong to the selected court and must not be blocked.
- A pending booking locks its slot for 10 minutes.
- A confirmed booking prevents another booking for the same slot.
- The payment method is `cash_on_location`.
- The default deposit is LKR 500.
- Cancellation refund calculation:
  - 24 or more hours before the slot: LKR 500.
  - More than 0 and less than 24 hours before the slot: LKR 250.
  - At or after the slot time: LKR 0.
- Platform commission is calculated as 5% of `total_amount` at booking creation.
- Pending bookings older than 10 minutes are automatically cancelled by a job that runs every 60 seconds.

## 3. Technology Stack

### Frontend

- React 18.2
- React Router DOM 6.22
- Vite 5.x
- Axios 1.6
- `vite-plugin-pwa` for installable PWA metadata and service-worker integration
- CSS Modules plus global CSS variables
- Browser `localStorage` for the JWT and current user record

### Backend

- Node.js with CommonJS modules
- Express 4.22
- SQLite persistence through `sql.js` 1.14; the database is loaded into memory and exported to a file after writes
- `bcryptjs` for password hashing
- `jsonwebtoken` for seven-day JWTs
- Multer for image uploads
- Helmet for security headers
- CORS with an allow-list
- `express-rate-limit` for API request limiting
- Nodemon for development

### Hosting configuration

- Frontend deployment is configured for Vercel with an SPA rewrite in `frontend/vercel.json`.
- Backend deployment is configured for Render in `backend/render.yaml`.
- The backend can serve a built frontend when `NODE_ENV=production`.
- The frontend development server proxies `/api` and `/uploads` to `http://localhost:4000`.

## 4. Architecture

### 4.1 Frontend architecture

`frontend/src/main.jsx` is the browser entry point. `App.jsx` owns the React Router tree and route guards. Protected screens are rendered inside `AppShell`, which supplies the desktop navigation, sidebar, top bar, and mobile navigation.

```text
frontend/src/
├── App.jsx                 Router and role guards
├── main.jsx                React entry point
├── api/
│   ├── client.js           Axios client and API namespaces
│   └── mockHandlers.js     Demo-mode mock implementations
├── components/             Reusable cards, controls, shell, and navigation
├── contexts/               Theme context
├── pages/                  Auth, customer, vendor, and admin screens
├── styles/                 Global styles and design variables
└── utils/                  Auth, formatting, and validation helpers
```

State is primarily local component state. There is no Redux or server-state cache. The Axios request interceptor reads `token` from `localStorage` and adds `Authorization: Bearer <token>` to API requests. `VITE_DEMO_MODE=true` swaps the API namespaces for local mock handlers.

### 4.2 Backend architecture

```text
backend/src/
├── server.js               Express setup, middleware, uploads, route mounting
├── db.js                   sql.js initialization and persistence wrapper
├── routes/                 URL definitions and authorization guards
├── controllers/            Court, booking, and auth business logic
├── middleware/             JWT authorization and error handling
├── database/schema.sql     Database schema
├── database/seed.js        Demo users, courts, and slots
├── jobs/expireBookings.js  Pending-booking expiry job
└── utils/                  JWT and validation helpers
```

The API is mounted under `/api`. Middleware order includes Helmet, CORS, JSON/form parsing, a 200-request-per-15-minute API rate limit, static upload serving, route authorization, and centralized error handling.

### 4.3 Authentication and authorization

- Registration hashes passwords with bcrypt.
- Login returns a JWT containing the authenticated user identity and role.
- The frontend stores the token and user in `localStorage`.
- `authenticate` rejects missing, invalid, or expired bearer tokens with HTTP 401.
- `requireRole` rejects users outside the route's permitted roles with HTTP 403.
- Customer routes are protected by ownership checks in controllers.
- Vendor routes allow `vendor` and `admin`; admin routes allow only `admin`.

## 5. Frontend Routes

Routes below are the routes currently registered in `frontend/src/App.jsx`.

| Path | Screen | Access | State |
|---|---|---|---|
| `/login` | Login | Public | Implemented |
| `/register` | Registration | Public | Implemented |
| `/` | Browse courts | Authenticated | Implemented |
| `/book/:courtId` | Booking flow for a court | Authenticated | Implemented |
| `/bookings/new` | Booking flow entry | Authenticated | Implemented |
| `/booking-confirmed/:bookingId` | Booking confirmation | Authenticated | Implemented |
| `/bookings` | My bookings | Authenticated | Implemented |
| `/loyalty` | Loyalty points | Authenticated | UI only |
| `/profile` | Profile | Authenticated | Implemented |
| `/vendor` | Vendor dashboard | Vendor | Implemented |
| `/vendor/bookings` | Vendor bookings | Vendor | Implemented |
| `/vendor/slots` | Vendor slot calendar | Vendor | Implemented |
| `/vendor/courts` | Vendor courts | Vendor | Implemented |
| `/vendor/analytics` | Vendor analytics | Vendor | Static UI |
| `/admin` | Admin dashboard | Admin | Implemented |
| `/admin/bookings` | All bookings | Admin | Implemented |
| `/admin/users` | User management | Admin | Implemented |
| `/admin/venues` | Court management and activation | Admin | Implemented |
| `/admin/revenue` | Revenue overview | Admin | Static UI |
| `*` | Redirect to `/` | Any | Implemented |

There is a `BookingDetailPage` file in the tree, but it is not currently imported or registered in `App.jsx`; `/bookings/:id` is therefore not an active frontend route.

## 6. REST API Contract

All paths below are relative to `/api`. Protected endpoints require `Authorization: Bearer <jwt>`.

### Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a customer account |
| POST | `/auth/login` | Public | Authenticate and return JWT/user |
| GET | `/auth/me` | Authenticated | Return current user |
| PUT | `/auth/me` | Authenticated | Update profile |

### Courts and availability

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/courts` | Public | List active courts; supports city/search filters |
| GET | `/courts/:id` | Public | Get court details |
| GET | `/courts/:id/slots?date=YYYY-MM-DD` | Public | Get available slots for a date |
| POST | `/courts` | Vendor/Admin | Create a court |
| PUT | `/courts/:id` | Vendor/Admin | Update a court |
| DELETE | `/courts/:id` | Vendor/Admin | Deactivate a court |
| POST | `/courts/:id/slots` | Vendor/Admin | Create availability slots |

### Customer bookings

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/bookings` | Authenticated | Create pending booking and 10-minute lock |
| GET | `/bookings` | Authenticated | List the current customer's bookings |
| GET | `/bookings/:id` | Authenticated | Get an owned booking |
| POST | `/bookings/:id/confirm` | Authenticated | Confirm cash payment and booking |
| POST | `/bookings/:id/cancel` | Authenticated | Cancel and calculate refund |

### Vendor operations

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/vendor/courts` | Vendor/Admin | List courts owned by the vendor |
| GET | `/vendor/slots` | Vendor/Admin | List owned-court slots, optionally filtered |
| PUT | `/vendor/slots/:slot_id/block` | Vendor/Admin | Block or unblock a slot |
| GET | `/vendor/bookings` | Vendor/Admin | List bookings for owned courts |
| PUT | `/vendor/bookings/:id/status` | Vendor/Admin | Update a booking status |

### Administration

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/admin/users` | Admin | List users |
| PUT | `/admin/users/:id/role` | Admin | Change user role |
| GET | `/admin/courts` | Admin | List all courts and vendors |
| PUT | `/admin/courts/:id/approve` | Admin | Activate/deactivate a court |
| GET | `/admin/bookings` | Admin | List all bookings |
| GET | `/admin/stats` | Admin | Return dashboard metrics and recent bookings |

### Uploads

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/upload` | Authenticated | Upload one JPEG, PNG, WebP, or GIF image; maximum 5 MB |
| GET | `/uploads/:filename` | Public | Serve an uploaded image |

The upload endpoint returns a relative URL such as `/uploads/<generated-file-name>`. Files are stored locally in `public/uploads` by default.

### Error conventions

The API returns JSON errors through the centralized error handler. Common statuses are 400 for invalid input, 401 for authentication failures, 403 for role/permission failures, 404 for missing resources, 409 for slot conflicts, 410 for expired booking windows, and 500 for unexpected server failures.

## 7. Data Model

### `users`

Stores identity and authorization data. Roles are `customer`, `vendor`, and `admin`. Email is unique.

### `courts`

Stores vendor ownership, name, description, city, address, coordinates, surface type, pitch size, hourly price, JSON-encoded image paths, and active state. The schema currently constrains city to `colombo` or `kandy`.

### `availability_slots`

Stores a court, date, start time, end time, and `is_blocked` flag. Slots are hourly in the seeded data, but the schema does not enforce an hourly duration.

### `bookings`

Stores the booking reference, customer, court, slot, lifecycle status, payment values, commission, lock expiry, cancellation data, notes, and timestamps. Supported statuses are `pending`, `confirmed`, `cancelled`, `completed`, and `no_show`.

### `reviews`

The table exists with booking, customer, court, rating, and comment fields. No backend routes, controller, frontend API method, or active screen currently uses it.

## 8. Booking Lifecycle

```text
Customer selects slot
        |
        v
pending + slot lock for 10 minutes
        |
        +--> payment confirmed --> confirmed --> completed/no_show (future operational flow)
        |
        +--> customer cancels or timer expires --> cancelled
```

The controller checks for an existing confirmed booking or an unexpired pending lock before inserting a new booking. The expiry job updates old pending records to `cancelled`. Refund values are calculated and returned, but there is no payment provider or money-transfer integration to issue a real refund.

## 9. Local Development

### Prerequisites

- Node.js and npm
- A shell with access to the repository

### Start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed       # optional; creates demo data
npm run dev        # nodemon, default port 5000 unless PORT is set
```

### Start the frontend

```bash
cd frontend
npm install
npm run dev        # Vite on port 5173
```

The current Vite proxy targets `http://localhost:4000`, so the backend should run on port 4000 for the standard local frontend/API pairing. Set `PORT=4000` in the backend environment or change the Vite proxy if using another port. The backend itself defaults to port 5000 when `PORT` is not set.

### Environment variables

Backend variables are documented in `backend/.env.example`:

- `NODE_ENV`: development or production.
- `PORT`: Express port.
- `DB_PATH`: SQLite file path.
- `JWT_SECRET`: signing secret; replace the example value outside local development.
- `UPLOAD_DIR`: image storage directory.
- `CORS_ORIGIN`: comma-separated allowed frontend origins.

Frontend variables:

- `VITE_API_BASE_URL`: API base URL; defaults to `/api`.
- `VITE_APP_NAME`: application name.
- `VITE_DEMO_MODE`: set to `true` to use local mock handlers.

### Demo accounts

The seed script creates:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@courts.lk` | `admin123` |
| Vendor | `vendor@courts.com` | `vendor123` |
| Customer | `test@courts.com` | `test123` |

These credentials are for development only and must not be used in a deployed environment.

### Production build

```bash
cd frontend
npm run build
npm run preview
```

The backend's production branch can serve `frontend/dist` when the frontend build is available at the expected relative path.

## 10. Deployment

### Frontend on Vercel

`frontend/vercel.json` rewrites all paths to `index.html`, allowing React Router routes to work on direct navigation. Build output is Vite's `dist` directory.

### Backend on Render

`backend/render.yaml` provisions a Node web service with `npm install` and `npm start`, generates `JWT_SECRET`, and mounts a 1 GB disk at `/data`.

**Deployment action required:** configure `DB_PATH` to a path under `/data` (for example `/data/courts.db`) and configure `UPLOAD_DIR` under `/data` if SQLite data and uploads must survive deploys/restarts. The current defaults are relative paths and do not explicitly use the mounted disk.

Set `CORS_ORIGIN` to the deployed frontend origin after Vercel deployment. Never commit production secrets.

## 11. Completed vs. Remaining Work

### Completed and usable

- Role-based authentication and authorization.
- Court discovery, filtering, details, and slot lookup.
- Court creation and management for vendors/admins.
- Image upload endpoint with type and size checks.
- Slot creation and vendor blocking.
- Customer booking creation, lock, confirmation, listing, and cancellation calculation.
- Automatic pending-booking expiry.
- Admin user, court, booking, and dashboard-stat operations.
- Responsive React shell and PWA manifest.
- Demo-mode frontend API handlers.

### Partially implemented or static

- **Loyalty:** page uses hardcoded 350 points and history; redeem button is disabled. No points tables or endpoints exist.
- **Vendor analytics:** charts and metrics are hardcoded in the page; no analytics endpoint exists.
- **Admin revenue:** venue rows and totals are hardcoded; no revenue-report endpoint exists.
- **Booking details UI:** backend `GET /api/bookings/:id` exists, but the corresponding frontend route is not registered.
- **Reviews:** schema exists, but the feature is not integrated.
- **Calendar export:** older documentation describes an `.ics` action, but the current route/page implementation does not provide a verified export flow.
- **Completion/no-show workflow:** the schema and vendor status endpoint support lifecycle values, but the complete operational rules and user experience need verification and test coverage.

### Not implemented

- Online payment gateway and real refund execution.
- Email, SMS, WhatsApp, OTP, and booking reminder notifications.
- Map or geolocation experience despite latitude/longitude fields.
- Team creation, group bookings, recurring customer bookings, or invitations.
- User suspension/ban workflow and audit trail.
- Automated tests, linting, formatting checks, CI/CD, and browser E2E coverage.
- Database backup/restore automation.
- A scalable relational database migration path for high concurrency.

## 12. Recommended Delivery Backlog

### Priority 0: release correctness

1. Add automated API tests for registration, login, role checks, court ownership, slot conflicts, booking expiry, confirmation, and refund calculation.
2. Add frontend tests for route guards and the customer/vendor/admin critical paths.
3. Fix production persistence configuration by setting `DB_PATH` and `UPLOAD_DIR` to the Render disk.
4. Align the Vite proxy, backend default port, and README instructions.
5. Replace demo credentials and example JWT secrets in any shared deployment configuration.
6. Add database backup and restore procedures before storing real customer bookings.

### Priority 1: complete the operational product

1. Implement real analytics and admin revenue endpoints, then connect both screens to live data.
2. Register and complete the booking detail route using the existing backend detail endpoint.
3. Define and implement a reviews API and customer/vendor review UX.
4. Define the completed/no-show status permissions and operational screens.
5. Implement a real payment provider, payment webhooks, reconciliation, and refund execution.
6. Add transactional/atomic slot booking protection to reduce concurrent-booking race conditions.

### Priority 2: customer retention and scale

1. Build loyalty tables, accrual rules, redemption validation, and booking integration.
2. Add email/SMS/WhatsApp confirmations and reminders.
3. Add maps, distance filtering, and vendor location validation.
4. Migrate from file-backed SQLite to PostgreSQL when concurrency and operational requirements justify it.
5. Add audit logging, user suspension, pagination, structured logging, monitoring, and alerting.

## 13. Known Risks and Assumptions

- SQLite is convenient for the MVP but is not a strong choice for high write concurrency or multi-instance deployment.
- `sql.js` loads the database in memory and writes the entire database file after writes; this needs operational testing with larger datasets.
- Booking conflict checks are application-level checks and are not backed by a database uniqueness constraint or transaction.
- Refunds are calculations only; no financial movement occurs.
- JWTs are stored in `localStorage`, which increases impact if a cross-site scripting defect is introduced. Input/output handling and CSP should be reviewed before production.
- The default city constraint limits expansion to Colombo and Kandy without a schema change.
- Times and dates are represented as strings/ISO values without a documented Sri Lanka timezone policy.
- Uploaded files are local disk assets with no deletion, CDN, virus scanning, or retention process.

## 14. Verification Checklist for the Team

- [ ] Run backend and frontend with the same configured port assumptions.
- [ ] Seed a clean database and verify all three demo accounts.
- [ ] Complete a customer booking from court selection through confirmation.
- [ ] Verify a second customer cannot take a locked or confirmed slot.
- [ ] Verify expiry cancels an unpaid booking after 10 minutes.
- [ ] Verify cancellation refund values at 24+ hours, under 24 hours, and after the slot.
- [ ] Verify vendor ownership prevents editing another vendor's court or booking.
- [ ] Verify admin-only endpoints reject customer and vendor tokens.
- [ ] Verify image type/size restrictions and persisted upload paths.
- [ ] Run `npm run build` in `frontend` before each frontend deployment.
- [ ] Confirm Render `DB_PATH`, `UPLOAD_DIR`, `CORS_ORIGIN`, and `JWT_SECRET` values before production.

## 15. Source Files for Further Reading

- `frontend/src/App.jsx` - active frontend route tree and guards.
- `frontend/src/api/client.js` - frontend API contract.
- `backend/src/server.js` - server setup, middleware, uploads, and route mounting.
- `backend/src/routes/` - backend endpoint definitions.
- `backend/src/controllers/` - business rules.
- `backend/src/database/schema.sql` - database model.
- `backend/src/database/seed.js` - demo data and accounts.
- `backend/src/jobs/expireBookings.js` - pending booking expiry.
- `frontend/vite.config.js` - frontend port and API proxy.
- `backend/render.yaml` and `frontend/vercel.json` - deployment configuration.