require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const courtRoutes = require('./routes/courts');
const bookingRoutes = require('./routes/bookings');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const { expirePendingBookings } = require('./jobs/expireBookings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', apiLimiter);

// Static uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(uploadDir));

// Image upload endpoint
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const { authenticate } = require('./middleware/auth');
app.post('/api/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

// Start server only after DB is ready
async function startServer() {
  await initDB();

  // Background job: expire pending bookings every 60 seconds
  setInterval(expirePendingBookings, 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Courts API running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Run `npm run seed` to populate test data.');
    }
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});

module.exports = app;
