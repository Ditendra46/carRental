const { supabase } = require('../supabase');
const { sendEmailForRental } = require('../utils/sendEmailForRental');

const addRental = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rental')
      .insert(req.body[1])
      .select();

    if (error) throw error;

    // Send email to the user
    const userEmail = req.body[0].email;
    const subject = 'Rental Confirmation';
    const replacements = {
      name: req.body[0].name,
      carModel: req.body[2].model,
      startDate: req.body[1].start_date,
      endDate: req.body[1].end_date
    };

    sendEmailForRental(userEmail, subject, 'rentalConfirmationEmail', replacements);

    res.status(201).json({
      success: true,
      data: data,
      message: 'Rental created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getAllRentals = async (req, res) => {
  try {
    const { data: rentals, error: rentalError } = await supabase
      .from('rental')
      .select('*');

    if (rentalError) throw rentalError;

    // Fetch related car and customer data for each rental
    const rentalDataWithRelations = await Promise.all(
      rentals.map(async (rental) => {
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('car_id,model, make, vin')
          .eq('car_id_formatted', rental.inventory_id)
          .maybeSingle(); // Assuming Car_ID_Formatted is unique

        if (carError) throw carError;

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('name, email_id, phone_no')
          .eq('customer_id_formatted', rental.customer_id)
          .maybeSingle(); // Assuming Customer_ID_Formatted is unique

        if (customerError) throw customerError;

        return {
          ...rental,
          car: car || null, // Handle cases where car might not be found
          customer: customer || null, // Handle cases where customer might not be found
        };
      })
    );

    res.status(200).json({
      success: true,
      data: rentalDataWithRelations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getRentalById = async (req, res) => {
  try {
    const { data: rentals, error: rentalError } = await supabase
      .from('rental')
      .select('*')
      .eq('rental_id', id)
      .single();;

    if (rentalError) throw rentalError;

    // Fetch related car and customer data for each rental
    const rentalDataWithRelations = await Promise.all(
      rentals.map(async (rental) => {
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('car_id,model, make, vin,rental_amount')
          .eq('car_id_formatted', rental.inventory_id)
          .single(); // Assuming Car_ID_Formatted is unique

        if (carError) throw carError;

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('name, email_id, phone_no,DL_No')
          .eq('customer_id_formatted', rental.customer_id)
          .single(); // Assuming Customer_ID_Formatted is unique

        if (customerError) throw customerError;

        return {
          ...rental,
          car: car || null, // Handle cases where car might not be found
          customer: customer || null, // Handle cases where customer might not be found
        };
      })
    );

    res.status(200).json({
      success: true,
      data: rentalDataWithRelations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const updateRental = async (req, res) => {
  try {
    const { id } = req.params; // Rental ID from the request parameters
    const {
      inventory_id,
      customer_id,
      start_date,
      end_date,
      ins_company,
      rental_status,
      rental_amount,
      notes,
    } = req.body; // Include all fields you want to update

    // Validate rental ID
    const { data: rentalData, error: rentalError } = await supabase
      .from('rental')
      .select('*')
      .eq('rental_id', id)
      .single();

    if (rentalError) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    // Validate inventory ID (car)
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .select('car_id')
      .eq('car_id_formatted', inventory_id)
      .single();

    if (carError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID',
      });
    }

    // Validate customer ID
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id_formatted', customer_id)
      .single();

    if (customerError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID',
      });
    }

    // Update rental details
    const { data, error } = await supabase
      .from('rental')
      .update({
        inventory_id,
        customer_id,
        start_date,
        end_date,
        ins_company,
        rental_status, // New field
        rental_amount, // New field
        notes, // New field
      })
      .eq('rental_id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
      message: 'Rental updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
module.exports = {
  addRental,
  getAllRentals,
  getRentalById,
  updateRental
};