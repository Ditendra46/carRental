const { supabase } = require('../supabase');

const processPayment = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      customerId,
      rentalId,
      paymentAmount,
      paymentMethod,
      notes = '',
      rental_detail_id // Array of selected rental detail IDs (as strings)
    } = req.body;


    // Validate required fields
    if (!customerId || !paymentAmount || !paymentMethod) {
      throw new Error('Missing required fields: customerId, paymentAmount, or paymentMethod.');
    }

    if (!rental_detail_id || rental_detail_id.length === 0) {
      throw new Error('No rental detail IDs provided.');
    }

    let remainingPayment = paymentAmount;

    // Insert payment record
    console.time('Insert Payment');
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id: customerId,
        rental_id: rentalId || null, // Nullable for advance payments
        payment_date: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: notes
      })
      .select('*')
      .single();
    console.timeEnd('Insert Payment');

    if (paymentError) {
      console.error('Error inserting payment record:', paymentError);
      throw paymentError;
    }

    const paymentId = paymentData.payment_id_formatted;

    // Process rental details
    if (rental_detail_id && rental_detail_id.length > 0) {
      console.time('Process Rental Details');
      for (const detailId of rental_detail_id) {
        if (remainingPayment <= 0) break;

        // Fetch rental detail
        const { data: rentalDetail, error: rentalDetailError } = await supabase
          .from('rental_details')
          .select('prorated_amount, total_paid')
          .eq('rental_detail_id_formatted', detailId) // Match the string directly
          .single();

        if (rentalDetailError) {
          console.error(`Error fetching rental detail ID ${detailId}:`, rentalDetailError);
          throw rentalDetailError;
        }

        const outstanding = rentalDetail.prorated_amount - rentalDetail.total_paid;
        const amountToApply = Math.min(outstanding, remainingPayment);
        const newTotalPaid = rentalDetail.total_paid + amountToApply;
        // Update rental detail
        console.time(`Update Rental Detail ${detailId}`);
        const { error: updateDetailError } = await supabase
          .from('rental_details')
          .update({ total_paid: newTotalPaid })
          .eq('rental_detail_id_formatted', detailId); // Match the string directly
        console.timeEnd(`Update Rental Detail ${detailId}`);

        if (updateDetailError) {
          console.error(`Error updating rental detail ID ${detailId}:`, updateDetailError);
          throw updateDetailError;
        }

        // Insert payment application
        console.time(`Insert Payment Application ${detailId}`);
        const { error: appError } = await supabase
          .from('payment_applications')
          .insert({
            payment_id: paymentId,
            rental_detail_id: detailId, // Use the string directly
            amount_applied: amountToApply
          });
        console.timeEnd(`Insert Payment Application ${detailId}`);

        if (appError) {
          console.error(`Error inserting payment application for detail ID ${detailId}:`, appError);
          throw appError;
        }

        remainingPayment -= amountToApply;
      }
      console.timeEnd('Process Rental Details');
    }

    // Update rental open amount
    if (rentalId) {
      console.time('Update Rentals');
      const { data: rentalData, error: rentalError } = await supabase
        .from('rentals')
        .select('open_amount')
        .eq('rental_id_formatted', rentalId)
        .single();
      console.timeEnd('Update Rentals');

      if (rentalError) {
        console.error('Error fetching rental data:', rentalError);
        throw rentalError;
      }

      const newOpenAmount = rentalData.open_amount - paymentAmount;

      const { error: updateRentalError } = await supabase
        .from('rentals')
        .update({ open_amount: newOpenAmount })
        .eq('rental_id_formatted', rentalId);

      if (updateRentalError) {
        console.error('Error updating rental open amount:', updateRentalError);
        throw updateRentalError;
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      paymentId,
      remainingPayment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
const getAllPayments = async (req, res) => {
  try {
    // Fetch all payments
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*');

    if (paymentError) {
      console.error('Error fetching payments:', paymentError);
      return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }

    // Fetch payment applications for each payment
    const paymentsWithApplications = await Promise.all(
      payments.map(async (payment) => {
        const { data: paymentApplications, error: applicationError } = await supabase
          .from('payment_applications')
          .select('rental_detail_id_formatted, amount_applied')
          .eq('payment_id', payment.payment_id_formatted);

        if (applicationError) {
          console.error(`Error fetching payment applications for payment ID ${payment.payment_id_formatted}:`, applicationError);
          return { ...payment, paymentApplications: [] }; // Return empty applications if there's an error
        }

        return { ...payment, paymentApplications };
      })
    );

    // Return the payments with their applications
    return res.status(200).json({ success: true, data: paymentsWithApplications });
  } catch (error) {
    console.error('Error fetching payments with applications:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
const getPaymentLink = async (req, res) => {
  try {
    // Extract data from the request body
    const { customerId, paymentAmount, paymentMethod, notes = '' } = req.body;
    // Validate required fields
    if (!customerId || !paymentAmount || !paymentMethod) {
      throw new Error('Missing required fields: customerId, paymentAmount, or paymentMethod.');
    }

    // Insert payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id: customerId,
        payment_date: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: notes
      })
      .select('*')
      .single();

    if (paymentError) {
      console.error('Error inserting payment record:', paymentError);
      throw paymentError;
    }

    // Return the payment data
    res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    console.error('Error in getPaymentLink:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getPaymentsByCustomer = async (req, res) => {
  try {
    // Extract customer_id from the request parameters or body
    const { customer_id } = req.params; // If passed as a route parameter
    // const { customer_id } = req.body; // Uncomment this if passed in the request body
    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Missing customer_id in the request.' });
    }

    // Fetch all payments for the given customer
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id',customer_id );

    if (paymentError) {
      console.error('Error fetching payments:', paymentError);
      return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }

    // Return the payments
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error in getPaymentsByCustomer:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
const applyPaymentToBills = async (req, res) => {
  try {
    const { customerId, selectedPayments, appliedBills } = req.body;

    if (!customerId || !selectedPayments || !appliedBills) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

    // Prepare payment application entries
    const paymentApplications = [];

    for (const bill of appliedBills) {
      const {
        rental_detail_id,
        rental_Id: rental_id_formatted,
        outstanding_amount,
        applied_amount
      } = bill;

      let amountToApply = applied_amount;

      for (const payment of selectedPayments) {
        if (amountToApply <= 0) break;

        const {
          payment_id_formatted,
          remaining_amount
        } = payment;

        if (remaining_amount <= 0) continue;

        const applyAmount = Math.min(amountToApply, remaining_amount);

        // Insert payment application record
        paymentApplications.push({
          payment_id: payment_id_formatted,
          rental_detail_id: rental_detail_id,
          amount_applied: applyAmount
        });

        // Update payment's remaining amount
        payment.remaining_amount -= applyAmount;
        payment.amount_applied = (payment.amount_applied || 0) + applyAmount;

        amountToApply -= applyAmount;
      }

      // Update the rental detail
      const { data: rentalDetail, error: rentalDetailError } = await supabase
        .from('rental_details')
        .select('total_paid')
        .eq('rental_detail_id_formatted', rental_detail_id)
        .single();

      if (rentalDetailError) {
        console.error(`Error fetching rental detail ${rental_detail_id}:`, rentalDetailError);
        return res.status(500).json({ success: false, message: 'Failed to fetch rental detail.' });
      }

      const newTotalPaid = rentalDetail.total_paid + applied_amount;

      const { error: billError } = await supabase
        .from('rental_details')
        .update({
          total_paid: newTotalPaid,
        })
        .eq('rental_detail_id_formatted', rental_detail_id);

      if (billError) {
        console.error(`Error updating rental detail ${rental_detail_id}:`, billError);
        return res.status(500).json({ success: false, message: 'Failed to update rental detail.' });
      }
    }

    // Update all selected payments
    for (const payment of selectedPayments) {
      const { payment_id_formatted, remaining_amount, amount_applied, amount } = payment;

      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          remaining_amount: remaining_amount,
        })
        .eq('payment_id_formatted', payment_id_formatted);

      if (updatePaymentError) {
        console.error(`Error updating payment ${payment_id_formatted}:`, updatePaymentError);
        return res.status(500).json({ success: false, message: 'Failed to update payment.' });
      }
    }

    // Insert all payment applications
    const { error: insertError } = await supabase
      .from('payment_applications')
      .insert(paymentApplications);

    if (insertError) {
      console.error('Error inserting payment applications:', insertError);
      return res.status(500).json({ success: false, message: 'Failed to insert payment applications.' });
    }

    // Update open amounts in Rentals
    const rentalIds = [...new Set(appliedBills.map(b => b.rental_Id))];
    for (const rentalId of rentalIds) {
      const { data: rentalDetails, error: rentalDetailsError } = await supabase
        .from('rental_details')
        .select('total_paid')
        .eq('rental_id', rentalId);

      if (rentalDetailsError) {
        console.error(`Error fetching rental details for rental ID ${rentalId}:`, rentalDetailsError);
        return res.status(500).json({ success: false, message: 'Failed to fetch rental details.' });
      }

      const newOpenAmount = rentalDetails.reduce((sum, d) => sum + d.outstanding_amount, 0);

      const { error: rentalUpdateError } = await supabase
        .from('rentals')
        .update({ open_amount: newOpenAmount })
        .eq('rental_id_formatted', rentalId);

      if (rentalUpdateError) {
        console.error(`Error updating rental open amount for rental ID ${rentalId}:`, rentalUpdateError);
        return res.status(500).json({ success: false, message: 'Failed to update rental open amount.' });
      }
    }

    res.status(200).json({ success: true, message: 'Payments applied successfully.' });
  } catch (error) {
    console.error('Error in applyPaymentToBills:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


const addPayemt = async (req, res) => {
  try {
    // Extract data from the request body
    const { customerId, paymentAmount, paymentMethod, notes = '' } = req.body;
   
    const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert({
      customer_id: customerId,
      payment_date: new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      payment_method: paymentMethod,
      remaining_amount: paymentAmount ,// Update remaining amount
      notes: notes
    })
    .select('*')
    .single();

  if (paymentError) {
    console.error('Error inserting payment record:', paymentError);
    throw paymentError;
  }

  // Return the payment data
  res.status(200).json({
    success: true,
    data: paymentData
  });
} catch (error) {
  console.error('Error in getPaymentLink:', error);
  res.status(400).json({
    success: false,
    error: error.message
  });
}
  }
  const getPreviousPayments = async (req, res) => {
    try {
      const customerId = req.params.customerId;
  
      if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
      }
  
      // Fetch previous payments for the customer
      const { data: payments, error } = await supabase
        .from('payments')
        .select('payment_id_formatted, amount, remaining_amount, payment_date, payment_method, notes')
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false });
  
      if (error) {
        console.error('Error fetching previous payments:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch previous payments.' });
      }
  
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      console.error('Error in getPreviousPayments:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };
  const getUserRentalDetailByPaymentId = async (req,res) => {
      try {
        const { paymentId } = req.params;
    console.log(paymentId)
    console.log(req.params)
        // Validate input
        if (!paymentId) {
          return res.status(400).json({ success: false, message: 'Payment ID is required.' });
        }
    
        // Fetch payment details
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('payment_id_formatted, customer_id, rental_id, amount, payment_date, payment_method, notes')
          .eq('payment_id_formatted', paymentId)
          .single();

          console.log(payment)

        if (paymentError) {
          console.error(`Error fetching payment details for ID ${paymentId}:`, paymentError);
          return res.status(500).json({ success: false, message: 'Failed to fetch payment details.' });
        }
        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('customer_id_formatted, name, email_id, phone_no')
          .eq('customer_id_formatted', payment.customer_id)
          .single();
          console.log(customer)

        if (customerError) {
          console.error(`Error fetching customer details for payment ID ${paymentId}:`, customerError);
          return res.status(500).json({ success: false, message: 'Failed to fetch customer details.' });
        }

        // Fetch rental details
        const { data: rental, error: rentalError } = await supabase
          .from('rentals')
          .select('rental_id_formatted, start_date, end_date')
          .eq('customer_id', payment.customer_id)
    
        if (rentalError) {
          console.error(`Error fetching rental details for payment ID ${paymentId}:`, rentalError);
          return res.status(500).json({ success: false, message: 'Failed to fetch rental details.' });
        }
    
        // Fetch rental detail records
        const { data: rentalDetails, error: rentalDetailsError } = await supabase
          .from('rental_details')
          .select('rental_detail_id_formatted, prorated_amount, total_paid, period_start_date, period_end_date')
          .eq('rental_id', rental.rental_id_formatted);
    
        if (rentalDetailsError) {
          console.error(`Error fetching rental detail records for payment ID ${paymentId}:`, rentalDetailsError);
          return res.status(500).json({ success: false, message: 'Failed to fetch rental detail records.' });
        }
    
        // Combine all data into a single response
        return res.status(200).json({
          success: true,
          data: {
            payment,
            customer,
            rental,
            rentalDetails
          }
        });
      } catch (error) {
        console.error('Error in getRentalDetailsByPaymentId:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }
    };
    
  


  const getPendingBills = async (req, res) => {
    try {
      // Fetch all pending bills
      const { data: bills, error } = await supabase
        .from('rental_details')
        .select('rental_detail_id_formatted, rental_id, prorated_amount, total_paid, outstanding_amount, period_start_date, period_end_date')
        .gt('outstanding_amount', 0) // Only fetch bills with outstanding amounts
        .order('period_start_date', { ascending: true });
  
      if (error) {
        console.error('Error fetching pending bills:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch pending bills.' });
      }
  
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      console.error('Error in getPendingBills:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };
  const voidPayment = async (req, res) => {
    try {
      const { paymentId } = req.body;
      // Validate input
      if (!paymentId) {
        return res.status(400).json({ success: false, message: 'Payment ID is required.' });
      }
  
      // Fetch the payment record
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('payment_status')
        .eq('payment_id_formatted', paymentId)
        .single();
  
      if (fetchError) {
        console.error(`Error fetching payment with ID ${paymentId}:`, fetchError);
        return res.status(500).json({ success: false, message: 'Failed to fetch payment.' });
      }
  
      // Check if the payment is already voided
      if (payment.payment_status === 'void') {
        return res.status(400).json({ success: false, message: 'Payment is already voided.' });
      }
  
      // Update the payment status to 'void'
      const { error: updateError } = await supabase
        .from('payments')
        .update({ payment_status: 'Void' })
        .eq('payment_id_formatted', paymentId);
  
      if (updateError) {
        console.error(`Error updating payment status for ID ${paymentId}:`, updateError);
        return res.status(500).json({ success: false, message: 'Failed to void the payment.' });
      }
  
      // Return success response
      return res.status(200).json({ success: true, message: 'Payment voided successfully.' });
    } catch (error) {
      console.error('Error in voidPayment:', error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  };
    // Extract data from the request body
module.exports = { processPayment, getAllPayments,getPaymentLink,getPaymentsByCustomer,applyPaymentToBills,addPayemt,
  getPreviousPayments,getPendingBills,voidPayment,getUserRentalDetailByPaymentId  };
