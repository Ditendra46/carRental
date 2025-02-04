const express = require('express');
const router = express.Router();
const { getAllCustomers, addCustomer } = require('../controllers/customerController');

router.get('/', getAllCustomers);
router.post('/', addCustomer);

module.exports = router;