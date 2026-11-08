const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/courtController');

// Public
router.get('/', ctrl.listCourts);
router.get('/:id', ctrl.getCourt);
router.get('/:id/slots', ctrl.getSlots);

// Vendor
router.post('/', authenticate, requireRole('vendor', 'admin'), ctrl.createCourt);
router.put('/:id', authenticate, requireRole('vendor', 'admin'), ctrl.updateCourt);
router.delete('/:id', authenticate, requireRole('vendor', 'admin'), ctrl.deleteCourt);
router.post('/:id/slots', authenticate, requireRole('vendor', 'admin'), ctrl.createSlots);

module.exports = router;
