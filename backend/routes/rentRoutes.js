const express = require('express');
const router = express.Router();
const { addRental } = require('../controllers/rentController');

router.post('/', addRental);

module.exports = router;