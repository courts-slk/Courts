require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initDB, prepare } = require('../db');

async function seed() {
  try {
    await initDB();

    const existing = prepare('SELECT id FROM users WHERE email = ?').get('admin@courts.lk');
    if (existing) {
      console.log('Seed data already present, skipping.');
      process.exit(0);
    }

    const adminId = uuidv4();
    const vendorId = uuidv4();
    const customerId = uuidv4();
    const adminHash = bcrypt.hashSync('admin123', 10);
    const vendorHash = bcrypt.hashSync('vendor123', 10);
    const customerHash = bcrypt.hashSync('test123', 10);

    prepare(`INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES (?,?,?,?,?,?)`)
      .run(adminId, 'Admin User', 'admin@courts.lk', '+94771000000', adminHash, 'admin');

    prepare(`INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES (?,?,?,?,?,?)`)
      .run(vendorId, 'Demo Vendor', 'vendor@courts.com', '+94772000000', vendorHash, 'vendor');

    prepare(`INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES (?,?,?,?,?,?)`)
      .run(customerId, 'Test Customer', 'test@courts.com', '+94773000000', customerHash, 'customer');

    const court1Id = uuidv4();
    const court2Id = uuidv4();

    prepare(`INSERT INTO courts (id, vendor_id, name, description, city, address, latitude, longitude, surface_type, pitch_size, price_per_hour, images, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(court1Id, vendorId, 'Colombo Futsal Arena', 'Premium 5-a-side futsal courts with professional-grade turf and full facilities.', 'colombo', '42 Reid Avenue, Colombo 7', 6.9011, 79.8607, 'Artificial Turf', '5-a-side', 3500, JSON.stringify(['/uploads/court-placeholder.jpg']), 1);

    prepare(`INSERT INTO courts (id, vendor_id, name, description, city, address, latitude, longitude, surface_type, pitch_size, price_per_hour, images, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(court2Id, vendorId, 'The Cage Colombo', 'Indoor cage futsal — hard-wearing courts perfect for intense 6-a-side games.', 'colombo', '15 Duplication Road, Colombo 3', 6.8947, 79.8530, 'Hardwood', '6-a-side', 2500, JSON.stringify(['/uploads/court-placeholder.jpg']), 1);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const hours = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];
    for (const courtId of [court1Id, court2Id]) {
      for (const day of [today, tomorrow]) {
        for (const h of hours) {
          const [hh] = h.split(':');
          const end = `${String(Number(hh) + 1).padStart(2, '0')}:00`;
          prepare(`INSERT INTO availability_slots (id, court_id, date, start_time, end_time) VALUES (?,?,?,?,?)`)
            .run(uuidv4(), courtId, day, h, end);
        }
      }
    }

    console.log('✅ Seed complete.');
    console.log('  admin@courts.lk / admin123');
    console.log('  vendor@courts.com / vendor123');
    console.log('  test@courts.com / test123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
