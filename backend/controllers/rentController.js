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
          .select('car_id','model, make, vin')
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

module.exports = {
  addRental,
  getAllRentals,
};