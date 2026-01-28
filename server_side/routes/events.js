const express = require('express');
const router = express.Router();
const { list, get, create, update, remove } = require('../controllers/eventController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, list);
router.get('/:id', optionalAuth, get);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
