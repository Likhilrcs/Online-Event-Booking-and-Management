const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { create, userBookings, getById, cancel, listAll, remove } = require('../controllers/bookingController');

router.post('/', auth, create);
router.get('/me', auth, userBookings);
router.get('/', auth, admin, listAll);
router.get('/:id', auth, getById);
router.post('/:id/cancel', auth, cancel);
router.delete('/:id', auth, admin, remove);

module.exports = router;
