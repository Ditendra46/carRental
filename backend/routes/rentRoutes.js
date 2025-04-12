const express = require('express');
const router = express.Router();
const { addRental, getAllRentals,getRentalById,updateRental,getRentalsByCustomerId,getRentalDetailsByRentalId} = require('../controllers/rentController');

router.post('/', addRental);
router.get('/', getAllRentals);
router.get('/:id', getRentalById);
router.put('/:id', updateRental);
router.get('/customer/:customerId', getRentalsByCustomerId);
router.get('/rentalDetails/:rentalId', getRentalDetailsByRentalId);

module.exports = router;