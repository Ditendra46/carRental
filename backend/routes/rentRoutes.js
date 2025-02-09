const express = require('express');
const router = express.Router();
const { addRental, getAllRentals } = require('../controllers/rentController');

router.post('/', addRental);
router.get('/', getAllRentals);

module.exports = router;