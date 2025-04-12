const { supabase } = require('../supabase');
const { sendEmailForRental } = require('../utils/sendEmailForRental');
const { generateRentalDetails } = require('../utils/rentalUtils');


const addRental = async (req, res) => {
  try {
    // Ensure the payload is an object
    console.log('Rental Data:', req.body);
    const rentalData = Array.isArray(req.body) ? req.body[1] : req.body;

    if (!rentalData || typeof rentalData !== 'object') {
      throw new Error('Invalid rental data');
    }

    console.log('Processed Rental Data:', rentalData);

    // Insert into Rentals
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .insert({
        car_id: rentalData.car_id,
        customer_id: rentalData.customer_id,
        start_date: rentalData.start_date,
        end_date: rentalData.end_date,
        ins_company: rentalData.ins_company,
        ins_policy_no: rentalData.ins_policy_no,
        ins_expiry_dt: rentalData.ins_expiry_dt,
        discount: rentalData.discount,
        rate: rentalData.rate,
        rental_status: rentalData.rental_status,
        rental_amount: rentalData.rental_amount,
        //notes: rentalData.notes
      })
      //.returning('rental_id_formatted')
      .select('rental_id_formatted')
      .single();

    if (rentalError) {
      console.error('Error inserting into Rentals:', rentalError);
      throw rentalError;
    }

    // Generate and insert Rental_Details
    const rentalDetails = generateRentalDetails(
      rental.rental_id_formatted,
      rentalData.start_date,
      rentalData.end_date,
      rentalData.rate,
      rentalData.discount || 0
    );

    const totalDue = rentalDetails.reduce((sum, d) => sum + d.prorated_amount, 0);

    const { error: detailsError } = await supabase
      .from('rental_details')
      .insert(rentalDetails);

    if (detailsError) {
      console.error('Error inserting into Rental_Details:', detailsError);
      throw detailsError;
    }

    // Update Open_Amount with initial total due
    const { error: updateError } = await supabase
      .from('rentals')
      .update({ open_amount: totalDue })
      .eq('rental_id_formatted', rental.rental_id_formatted);

    if (updateError) {
      console.error('Error updating Open_Amount:', updateError);
      throw updateError;
    }
console.log(rentalData.car_id)
    res.json({ message: 'Rental created', rentalId: rental.rental_id_formatted,car_id:rentalData.car_id });
  } catch (error) {
    console.error('Error in addRental:', error);
    res.status(500).json({ error: error.message });
  }
};

const getRentalDetails = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rental_details')
      .select('*')
      .eq('rental_id', req.params.rentalId)
      .order('period_start_date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const carRental = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rentals')
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
      .from('rentals')
      .select('*');

    if (rentalError) throw rentalError;

    // Fetch related car and customer data for each rental
    const rentalDataWithRelations = await Promise.all(
      rentals.map(async (rental) => {
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('car_id,model, make, vin')
          .eq('car_id_formatted', rental.car_id)
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
    const { id } = req.params;

    // Fetch the rental data by ID
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select('*')
      .eq('rental_id', id)
      .single();
console.log(rental)
    if (rentalError) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    // Fetch related car data
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('car_id, model, make, vin, default_rental_rate')
      .eq('car_id_formatted', rental.car_id)
      .single(); // Assuming Car_ID_Formatted is unique

    if (carError) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Fetch related customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('name, email_id, phone_no, dl_no')
      .eq('customer_id_formatted', rental.customer_id)
      .single(); // Assuming Customer_ID_Formatted is unique

    if (customerError) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Combine rental, car, and customer data
    const rentalDataWithRelations = {
      ...rental,
      car: car || null, // Handle cases where car might not be found
      customer: customer || null, // Handle cases where customer might not be found
    };

    // Send the response
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
      .from('rentals')
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
const getRentalsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params; // Extract customer_id from request parameters

    // Fetch rentals for the given customer_id
    const { data: rentals, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('customer_id', customerId)
      .order('rental_id', { ascending: false });


    if (error) {
      throw error;
    }

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rentals found for the given customer ID',
      });
    }

    // Fetch related car and customer data for each rental
    const rentalDataWithRelations = await Promise.all(
      rentals.map(async (rental) => {
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('car_id, model, make, vin')
          .eq('car_id_formatted', rental.inventory_id)
          .maybeSingle(); // Assuming Car_ID_Formatted is unique

        if (carError) throw carError;

        return {
          ...rental,
          car: car || null, // Handle cases where car might not be found
        };
      })
    );

    res.status(200).json({
      success: true,
      data: rentalDataWithRelations,
    });
  } catch (error) {
    console.error('Error fetching rentals by customer ID:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getRentalDetailsByRentalId = async (req, res) => {
  try {
    const { rentalId } = req.params; // Extract Rental_ID from request parameters
console.log(rentalId)
    // Fetch rental details for the given Rental_ID
    const { data: rentalDetails, error } = await supabase
      .from('rental_details')
      .select('*')
      .eq('rental_id', rentalId)
      .order('period_start_date', { ascending: true })

     

    if (error) {
      throw error;
    }
//console.log(rentalDetails)
    if (!rentalDetails || rentalDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No rental details found for the given Rental ID',
      });
    }

    res.status(200).json({
      success: true,
      data: rentalDetails,
    });
  } catch (error) {
    console.error('Error fetching rental details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
module.exports = {
  addRental,
  getAllRentals,
  getRentalById,
  updateRental,
  getRentalDetails,
  getRentalsByCustomerId,
  getRentalDetailsByRentalId
};