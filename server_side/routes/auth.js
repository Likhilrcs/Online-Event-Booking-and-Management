const express = require('express');
const router = express.Router();
const { register, login, requestReset, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/request-reset', requestReset);
router.post('/reset/:token', resetPassword);

module.exports = router;
