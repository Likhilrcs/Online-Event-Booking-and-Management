const express = require('express');
const router = express.Router({ mergeParams: true });
const { auth } = require('../middleware/auth');
const { listForEvent, create } = require('../controllers/reviewController');

router.get('/:eventId', listForEvent);
router.post('/', auth, create);

module.exports = router;
