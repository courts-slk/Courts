// In-memory demo data store for Vercel demo mode

const today = () => new Date().toISOString().split('T')[0];
const addDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];

const DEMO_CUSTOMERS = {
  'test@courts.com':   { id: 'demo-customer', full_name: 'Kasun Perera',    email: 'test@courts.com',    role: 'customer', phone: '+94771234567' },
  'vendor@courts.com': { id: 'demo-vendor',   full_name: 'Sport Venues LK', email: 'vendor@courts.com',  role: 'vendor',   phone: '+94777654321' },
  'admin@courts.lk':   { id: 'demo-admin',    full_name: 'System Admin',    email: 'admin@courts.lk',    role: 'admin',    phone: null },
};

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

// ── Mutable state ─────────────────────────────────────────────────────────────

let state = {
  courts: [
    { id: 'court-1', vendor_id: 'demo-vendor', name: 'FutsalArena Colombo', city: 'colombo', address: '45 Galle Road, Colombo 03', surface_type: 'Artificial Turf', pitch_size: '5-a-side', price_per_hour: 3500, is_active: 1, images: [], vendor_name: 'Sport Venues LK', description: 'Premium indoor futsal court with professional artificial turf and bright LED lighting.', created_at: '2024-01-10T08:00:00Z' },
    { id: 'court-2', vendor_id: 'demo-vendor', name: 'GoalZone Sports',     city: 'colombo', address: '12 Baseline Road, Colombo 09', surface_type: 'Hardwood',        pitch_size: '5-a-side', price_per_hour: 4000, is_active: 1, images: [], vendor_name: 'Sport Venues LK', description: 'Modern hardwood court with excellent lighting and changing room facilities.', created_at: '2024-01-15T08:00:00Z' },
    { id: 'court-3', vendor_id: 'demo-vendor', name: 'Kick Arena Premium',  city: 'colombo', address: '88 Duplication Road, Colombo 04', surface_type: 'Artificial Turf', pitch_size: '7-a-side', price_per_hour: 5000, is_active: 1, images: [], vendor_name: 'Sport Venues LK', description: 'Large format 7-a-side court, ideal for competitive matches and training.', created_at: '2024-02-01T08:00:00Z' },
  ],
  bookings: [],
  users: Object.values(DEMO_CUSTOMERS).map((u, i) => ({
    ...u,
    created_at: `2024-0${i + 1}-01T08:00:00Z`,
  })),
  slots: {},   // { 'courtId_date': [slotObjects] }
  bookingCounter: 1,
};

// Pre-seed a few bookings for the demo customer
function seedBookings() {
  const t = today();
  const tomorrow = addDays(1);
  const yesterday = addDays(-1);
  state.bookings = [
    { id: 'booking-1', booking_reference: 'CRT-2024-001', customer_id: 'demo-customer', court_id: 'court-1', court_name: 'FutsalArena Colombo', slot_id: `slot-court-1-${tomorrow}-15`, date: tomorrow, start_time: '15:00', end_time: '16:00', status: 'confirmed', total_amount: 3500, deposit_amount: 500, cancellation_reason: null, customer_name: 'Kasun Perera' },
    { id: 'booking-2', booking_reference: 'CRT-2024-002', customer_id: 'demo-customer', court_id: 'court-2', court_name: 'GoalZone Sports',     slot_id: `slot-court-2-${t}-11`,       date: t,       start_time: '11:00', end_time: '12:00', status: 'pending',   total_amount: 4000, deposit_amount: 500, cancellation_reason: null, customer_name: 'Kasun Perera' },
    { id: 'booking-3', booking_reference: 'CRT-2024-003', customer_id: 'demo-customer', court_id: 'court-1', court_name: 'FutsalArena Colombo', slot_id: `slot-court-1-${yesterday}-16`, date: yesterday, start_time: '16:00', end_time: '17:00', status: 'completed', total_amount: 3500, deposit_amount: 500, cancellation_reason: null, customer_name: 'Kasun Perera' },
    // Extra bookings for vendor dashboard stats
    { id: 'booking-4', booking_reference: 'CRT-2024-004', customer_id: 'demo-customer-2', court_id: 'court-2', court_name: 'GoalZone Sports', slot_id: `slot-court-2-${tomorrow}-10`, date: tomorrow, start_time: '10:00', end_time: '11:00', status: 'confirmed', total_amount: 4000, deposit_amount: 500, cancellation_reason: null, customer_name: 'Amaya Silva' },
    { id: 'booking-5', booking_reference: 'CRT-2024-005', customer_id: 'demo-customer-3', court_id: 'court-3', court_name: 'Kick Arena Premium', slot_id: `slot-court-3-${t}-14`, date: t, start_time: '14:00', end_time: '15:00', status: 'confirmed', total_amount: 5000, deposit_amount: 500, cancellation_reason: null, customer_name: 'Roshan Fernando' },
  ];
  state.bookingCounter = 6;
}

seedBookings();

// ── Helpers ───────────────────────────────────────────────────────────────────

const ok = (data) => Promise.resolve({ data });
const err = (msg, status = 400) => Promise.reject({ response: { status, data: { error: msg } } });

function generateSlotsForDate(courtId, date) {
  const key = `${courtId}_${date}`;
  if (!state.slots[key]) {
    // Generate default 9am-11pm slots
    const bookedHours = [10, 14, 18];
    state.slots[key] = [];
    for (let h = 9; h < 23; h++) {
      state.slots[key].push({
        id: `slot-${courtId}-${date}-${h}`,
        court_id: courtId,
        date,
        start_time: `${String(h).padStart(2, '0')}:00`,
        end_time:   `${String(h + 1).padStart(2, '0')}:00`,
        is_blocked: 0,
        is_available: bookedHours.includes(h) ? 0 : 1,
      });
    }
  }
  return state.slots[key];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const mockAuthAPI = {
  login: ({ email, password }) => {
    const user = DEMO_CUSTOMERS[email?.toLowerCase()];
    if (!user || !password) return err('Invalid email or password', 401);
    return ok({ token: 'demo-token-' + Date.now(), user });
  },
  register: ({ full_name, email, phone, role }) => {
    if (!full_name || !email) return err('Name and email required');
    if (DEMO_CUSTOMERS[email?.toLowerCase()]) return err('Email already in use', 409);
    const newUser = { id: 'demo-new-' + Date.now(), full_name, email, phone: phone || null, role: role || 'customer' };
    DEMO_CUSTOMERS[email] = newUser;
    state.users.push({ ...newUser, created_at: new Date().toISOString() });
    return ok({ token: 'demo-token-' + Date.now(), user: newUser });
  },
  me: () => {
    const user = getCurrentUser();
    return user ? ok(user) : err('Unauthorized', 401);
  },
  updateProfile: ({ full_name, phone }) => {
    const user = getCurrentUser();
    if (!user) return err('Unauthorized', 401);
    const updated = { ...user, full_name: full_name || user.full_name, phone: phone ?? user.phone };
    return ok({ user: updated });
  },
};

// ── Courts ────────────────────────────────────────────────────────────────────

export const mockCourtsAPI = {
  list: (params = {}) => {
    let courts = state.courts.filter(c => c.is_active);
    if (params.city) courts = courts.filter(c => c.city === params.city.toLowerCase());
    if (params.search) {
      const q = params.search.toLowerCase();
      courts = courts.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    return ok(courts);
  },
  get: (id) => {
    const court = state.courts.find(c => c.id === id && c.is_active);
    return court ? ok(court) : err('Court not found', 404);
  },
  getSlots: (courtId, date) => {
    const slots = generateSlotsForDate(courtId, date);
    // Mark slots that have confirmed bookings as unavailable
    const bookedSlotIds = state.bookings
      .filter(b => b.status !== 'cancelled')
      .map(b => b.slot_id);
    const result = slots.map(s => ({ ...s, is_available: bookedSlotIds.includes(s.id) ? 0 : (s.is_blocked ? 0 : 1) }));
    return ok(result);
  },
  create: (data) => {
    const user = getCurrentUser();
    if (!user || user.role !== 'vendor') return err('Forbidden', 403);
    const newCourt = {
      id: 'court-' + Date.now(),
      vendor_id: user.id,
      name: data.name,
      description: data.description || null,
      city: data.city,
      address: data.address,
      surface_type: data.surface_type || null,
      pitch_size: data.pitch_size || null,
      price_per_hour: parseFloat(data.price_per_hour),
      is_active: 1,
      images: data.images || [],
      vendor_name: user.full_name,
      created_at: new Date().toISOString(),
    };
    state.courts.push(newCourt);
    return ok(newCourt);
  },
  update: (id, data) => {
    const idx = state.courts.findIndex(c => c.id === id);
    if (idx === -1) return err('Court not found', 404);
    state.courts[idx] = { ...state.courts[idx], ...data, price_per_hour: data.price_per_hour ? parseFloat(data.price_per_hour) : state.courts[idx].price_per_hour };
    return ok(state.courts[idx]);
  },
  delete: (id) => {
    const idx = state.courts.findIndex(c => c.id === id);
    if (idx !== -1) state.courts[idx].is_active = 0;
    return ok({ message: 'Court deactivated' });
  },
  createSlots: (courtId, data) => {
    const { date, start_time, end_time, recurring, days: numDays = 1 } = data;
    const created = [];
    const totalDays = recurring ? Math.min(parseInt(numDays) || 1, 30) : 1;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const key = `${courtId}_${dateStr}`;
      if (!state.slots[key]) state.slots[key] = [];
      const exists = state.slots[key].find(s => s.start_time === start_time);
      if (!exists) {
        const slot = { id: `slot-${courtId}-${dateStr}-${start_time.replace(':', '')}`, court_id: courtId, date: dateStr, start_time, end_time, is_blocked: 0, is_available: 1 };
        state.slots[key].push(slot);
        created.push(slot);
      }
    }
    return ok(created);
  },
};

// ── Bookings ──────────────────────────────────────────────────────────────────

export const mockBookingsAPI = {
  create: (data) => {
    const user = getCurrentUser();
    if (!user) return err('Unauthorized', 401);
    const court = state.courts.find(c => c.id === data.court_id);
    if (!court) return err('Court not found', 404);
    // Find slot details
    const dateStr = data.slot_id?.split('-').slice(-2, -1)[0] || today();
    const hourStr = data.slot_id?.split('-').pop() || '09';
    const h = parseInt(hourStr.substring(0, 2));
    const start_time = `${String(h).padStart(2, '0')}:00`;
    const end_time   = `${String(h + 1).padStart(2, '0')}:00`;
    // Try to get real date from slot lookup
    let slotDate = dateStr;
    const slotObj = Object.values(state.slots).flat().find(s => s.id === data.slot_id);
    if (slotObj) { slotDate = slotObj.date; }
    const ref = `CRT-2024-${String(state.bookingCounter).padStart(3, '0')}`;
    const booking = {
      id: 'booking-' + Date.now(),
      booking_reference: ref,
      customer_id: user.id,
      court_id: court.id,
      court_name: court.name,
      slot_id: data.slot_id,
      date: slotObj?.date || today(),
      start_time: slotObj?.start_time || start_time,
      end_time:   slotObj?.end_time   || end_time,
      status: 'pending',
      total_amount: data.total_amount || court.price_per_hour,
      deposit_amount: 500,
      cancellation_reason: null,
      customer_name: user.full_name,
    };
    state.bookings.push(booking);
    state.bookingCounter++;
    return ok(booking);
  },
  list: () => {
    const user = getCurrentUser();
    if (!user) return err('Unauthorized', 401);
    const bookings = state.bookings.filter(b => b.customer_id === user.id);
    return ok(bookings);
  },
  get: (id) => {
    const booking = state.bookings.find(b => b.id === id);
    return booking ? ok(booking) : err('Booking not found', 404);
  },
  confirm: (id) => {
    const idx = state.bookings.findIndex(b => b.id === id);
    if (idx === -1) return err('Booking not found', 404);
    state.bookings[idx] = { ...state.bookings[idx], status: 'confirmed' };
    return ok(state.bookings[idx]);
  },
  cancel: (id, data) => {
    const idx = state.bookings.findIndex(b => b.id === id);
    if (idx === -1) return err('Booking not found', 404);
    state.bookings[idx] = { ...state.bookings[idx], status: 'cancelled', cancellation_reason: data?.cancellation_reason || null };
    return ok(state.bookings[idx]);
  },
};

// ── Vendor ────────────────────────────────────────────────────────────────────

export const mockVendorAPI = {
  getCourts: () => {
    const user = getCurrentUser();
    if (!user) return err('Unauthorized', 401);
    return ok(state.courts.filter(c => c.vendor_id === user.id));
  },
  getSlots: (courtId, date) => {
    const key = `${courtId}_${date}`;
    const slots = state.slots[key] || generateSlotsForDate(courtId, date);
    return ok(slots);
  },
  blockSlot: (slotId, data) => {
    for (const key of Object.keys(state.slots)) {
      const idx = state.slots[key].findIndex(s => s.id === slotId);
      if (idx !== -1) {
        state.slots[key][idx].is_blocked = data.is_blocked ? 1 : 0;
        return ok({ id: slotId, is_blocked: !!data.is_blocked });
      }
    }
    return err('Slot not found', 404);
  },
  getBookings: () => {
    const user = getCurrentUser();
    if (!user) return err('Unauthorized', 401);
    const vendorCourtIds = state.courts.filter(c => c.vendor_id === user.id).map(c => c.id);
    return ok(state.bookings.filter(b => vendorCourtIds.includes(b.court_id)));
  },
  updateBookingStatus: (id, data) => {
    const idx = state.bookings.findIndex(b => b.id === id);
    if (idx === -1) return err('Booking not found', 404);
    state.bookings[idx] = { ...state.bookings[idx], status: data.status };
    return ok(state.bookings[idx]);
  },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const mockAdminAPI = {
  getUsers: () => ok(state.users),
  updateUserRole: (id, data) => {
    const idx = state.users.findIndex(u => u.id === id);
    if (idx !== -1) state.users[idx].role = data.role;
    return ok(state.users[idx]);
  },
  getCourts: () => ok(state.courts),
  approveCourt: (id, data) => {
    const idx = state.courts.findIndex(c => c.id === id);
    if (idx !== -1) state.courts[idx].is_active = data.is_active ? 1 : 0;
    return ok(state.courts[idx]);
  },
  getBookings: () => ok(state.bookings),
  getStats: () => {
    const confirmed = state.bookings.filter(b => b.status === 'confirmed');
    const revenue = confirmed.reduce((s, b) => s + (b.total_amount || 0), 0);
    return ok({
      totalUsers: state.users.length + 21,
      totalCourts: state.courts.filter(c => c.is_active).length,
      todayBookings: state.bookings.filter(b => b.date === today()).length,
      totalRevenue: revenue + 112000,
      recentBookings: state.bookings.slice(-5).reverse(),
    });
  },
};
