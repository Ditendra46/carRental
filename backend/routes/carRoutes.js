const express = require('express');
const router = express.Router();
const { getAllCars, addCar } = require('../controllers/carController');

router.get('/', getAllCars);
router.post('/', addCar);

module.exports = router;