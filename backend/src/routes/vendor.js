const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/courtController');

const guard = [authenticate, requireRole('vendor', 'admin')];

router.get('/courts', ...guard, ctrl.getVendorCourts);
router.get('/slots', ...guard, ctrl.getVendorSlots);
router.put('/slots/:slot_id/block', ...guard, ctrl.blockSlot);
router.get('/bookings', ...guard, ctrl.getVendorBookings);
router.put('/bookings/:id/status', ...guard, ctrl.updateBookingStatus);

module.exports = router;
