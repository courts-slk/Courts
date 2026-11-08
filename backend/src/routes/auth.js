const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { register, login, me, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateProfile);

module.exports = router;
