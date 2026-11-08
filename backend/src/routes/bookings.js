const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/bookingController');

router.post('/', authenticate, ctrl.createBooking);
router.get('/', authenticate, ctrl.listBookings);
router.get('/:id', authenticate, ctrl.getBooking);
router.post('/:id/confirm', authenticate, ctrl.confirmBooking);
router.post('/:id/cancel', authenticate, ctrl.cancelBooking);

module.exports = router;
