const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { getProfile, updateProfile, list, remove, getStats } = require('../controllers/userController');

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.get('/', auth, admin, list);
router.delete('/:id', auth, admin, remove);
router.get('/admin/stats', auth, admin, getStats);

module.exports = router;
