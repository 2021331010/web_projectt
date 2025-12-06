const express = require('express');
const router = express.Router();
const { createFirstAdmin } = require('../controllers/adminController');

// প্রথম admin create করার জন্য route (login ছাড়া)
router.post('/register', createFirstAdmin);

module.exports = router;
