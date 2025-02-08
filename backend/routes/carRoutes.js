const express = require('express');
const router = express.Router();
const { getAllCars, addCar,deleteCar, getCarById,updateCar,updateCarStatusToRented} = require('../controllers/carController');

router.get('/', getAllCars);
router.post('/', addCar);
router.delete('/:id', deleteCar);
router.get('/:id', getCarById);
router.put('/:id', updateCar);
router.put('/updateStatus/:id', updateCarStatusToRented);
module.exports = router;