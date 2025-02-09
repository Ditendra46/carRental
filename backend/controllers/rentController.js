const { supabase } = require('../supabase');
const {sendEmailForRental}= require('../utils/sendEmailForRental');

const addRental = async (req, res) => {
  try {
    console.log(req.body[0])
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

module.exports = {
  addRental
};