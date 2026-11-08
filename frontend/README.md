# Courts Frontend

React.js (Vite) Progressive Web App for the Courts platform.

## Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Commands

- `npm run dev` — Start dev server with HMR
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally

## Environment Variables

Create `.env` or see `.env.example`:
- `VITE_API_BASE_URL` — Backend API URL (default `/api`)
- `VITE_APP_NAME` — App name (default `Courts`)

## Project Structure

```
src/
├── pages/                    # Full pages (Auth, Home, Booking, etc.)
│   ├── Auth/
│   ├── Home/
│   ├── Booking/
│   ├── Profile/
│   ├── Vendor/
│   └── Admin/
├── components/              # Reusable UI components
│   ├── Modal.jsx
│   ├── NavBar.jsx
│   ├── CourtCard.jsx
│   ├── SlotPicker.jsx
│   ├── BookingCard.jsx
│   └── LoadingSpinner.jsx
├── api/
│   └── client.js            # Axios instance + API functions
├── styles/
│   ├── variables.css        # Brand colors, spacing
│   ├── global.css           # Base styles
│   └── *.module.css         # Component-scoped styles
├── utils/
│   ├── auth.js              # Token & user localStorage
│   ├── formatters.js        # Date, currency, time helpers
│   └── validators.js        # Input validation
├── App.jsx                  # Router & private routes
└── main.jsx                 # Entry point
```

## Key Features

### Auth Flow
- Register/login with email & password
- JWT stored in localStorage
- Auto-logout on token expiry
- Demo accounts for quick testing

### Home Page
- City tabs: Colombo / Kandy
- Search bar for courts
- Grid of court cards
- Tap to view details

### Booking Flow
1. Select court → view details
2. Pick date & time slot (9am–11pm, 1-hour blocks)
3. Confirm booking (creates pending booking, 10-min lock)
4. Payment confirmed page with booking reference
5. Add to calendar (generates `.ics` file)

### My Bookings
- Tabs: Upcoming / Past / Cancelled
- Cards show court, date, time, amount, status
- Click to view details, cancel if eligible
- Cancellation calculates refund based on policy

### Profile
- View/edit name, phone
- Notifications preferences
- Terms & Privacy modals
- Logout

### Vendor Dashboard
- Summary cards: courts, today's bookings, revenue
- Quick links to manage courts, slots, bookings
- CourtManagementPage: add/edit/delete courts
- VendorBookingsPage: confirm/complete bookings

### Admin Dashboard
- Stats: users, courts, revenue
- Recent bookings table
- Links to user, court, booking management
- Can change roles and approve/reject courts

## Styling

Uses CSS modules for component isolation:
- `variables.css` — Colors, spacing, shadows, typography
- `global.css` — Base styles, utilities (btn, badge, card)
- `*.module.css` — Component-specific styles

Color scheme:
- Primary: #1D5E3A (dark green)
- Secondary: #2E7D52
- Accent: #F5F0E8
- Danger: #D1453B

## API Integration

File: `src/api/client.js`

Export namespaces:
- `authAPI` — register, login, me, updateProfile
- `courtsAPI` — list, get, getSlots, create, update, delete, createSlots
- `bookingsAPI` — create, list, get, confirm, cancel
- `vendorAPI` — getCourts, getSlots, blockSlot, getBookings, updateBookingStatus
- `adminAPI` — getUsers, updateUserRole, getCourts, approveCourt, getBookings, getStats
- `uploadAPI` — image (multipart form)

All requests auto-add `Authorization: Bearer {token}` header from localStorage.

## PWA Features

- `manifest.json` — App name, icons, theme color
- Installable on mobile via "Add to Home Screen"
- Service worker support (optional, manifest-only in MVP)

## Testing Accounts

Demo login buttons pre-fill:
- Customer: `test@courts.com` / `test123`
- Vendor: `vendor@courts.com` / `vendor123`

## Production Build

```bash
npm run build
```

Outputs to `dist/`. Serve this folder from backend at `/` path:

```javascript
// In backend server.js
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
```

## Notes

- Responsive mobile-first design
- Accessibility: semantic HTML, keyboard navigation
- No hardcoded URLs (uses VITE_API_BASE_URL)
- Error handling with user-friendly messages
- Loading states on async operations
