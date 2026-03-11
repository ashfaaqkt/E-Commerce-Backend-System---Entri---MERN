const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authentication');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
