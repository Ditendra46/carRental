const express = require('express');
const router = express.Router();
const { getAllCustomers, addCustomer,deleteCustomer,getCustomerById,updateCustomer,getCustomerByPhno } = require('../controllers/customerController');

router.get('/', getAllCustomers);
router.post('/', addCustomer);
router.delete('/:id', deleteCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.get('/phone-number/:phno', getCustomerByPhno);

module.exports = router;