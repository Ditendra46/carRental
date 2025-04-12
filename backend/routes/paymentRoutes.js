const express = require('express');
const router = express.Router();
const { processPayment,getAllPayments,getPaymentLink,getPaymentsByCustomer,applyPaymentToBills,addPayemt,getPreviousPayments,getPendingBills,voidPayment,getUserRentalDetailByPaymentId} = require('../controllers/paymentController');

router.post('/', processPayment);
router.get('/', getAllPayments);
router.post('/links',getPaymentLink)
router.post('/link',addPayemt)

router.get('/:customer_id',getPaymentsByCustomer)
router.post('/apply',applyPaymentToBills)
router.get('/previous',getPreviousPayments)
router.get('/pending',getPendingBills)
router.put('/void',voidPayment);
router.get('/link/:paymentId',getUserRentalDetailByPaymentId);
module.exports = router;