const express = require('express');
const router = express.Router();
const { addRental, getAllRentals,getRentalById,updateRental } = require('../controllers/rentController');

router.post('/', addRental);
router.get('/', getAllRentals);
router.get('/:id', getRentalById);
router.put('/:id', updateRental);

module.exports = router;