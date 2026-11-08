CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT CHECK(city IN ('colombo', 'kandy')) NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  surface_type TEXT,
  pitch_size TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  images TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(vendor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id TEXT PRIMARY KEY,
  court_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_blocked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(court_id) REFERENCES courts(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  court_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
  payment_method TEXT CHECK(payment_method IN ('cash_on_location')) DEFAULT 'cash_on_location',
  deposit_amount DECIMAL(10,2) DEFAULT 500.00,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  commission_amount DECIMAL(10,2),
  payment_confirmed BOOLEAN DEFAULT 0,
  payment_confirmed_at DATETIME,
  slot_locked_until DATETIME,
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(court_id) REFERENCES courts(id),
  FOREIGN KEY(customer_id) REFERENCES users(id),
  FOREIGN KEY(slot_id) REFERENCES availability_slots(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  court_id TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(booking_id) REFERENCES bookings(id),
  FOREIGN KEY(customer_id) REFERENCES users(id),
  FOREIGN KEY(court_id) REFERENCES courts(id)
);
