const express = require('express');
const router = express.Router();
const { createFirstAdmin } = require('../controllers/adminController');


router.post('/register', createFirstAdmin);

module.exports = router;
