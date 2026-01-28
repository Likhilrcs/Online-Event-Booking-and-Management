const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { listForUser, markRead } = require('../controllers/notificationController');

router.get('/me', auth, listForUser);
router.post('/:id/read', auth, markRead);

module.exports = router;
