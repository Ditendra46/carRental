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

const getAllRentals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        Rental_ID,
        Rental_ID_Formatted,
        Inventory_ID,
        Customer_ID,
        Ins_Company,
        Ins_Policy_No,
        Ins_Expiry_Dt,
        Start_Date,
        End_Date,
        Days,
        Duration,
        Rate,
        Discount,
        Rent_Amount,
        Pay_Method,
        Adv_Amnt,
        Ref_Amnt,
        Ref_Name,
        Ref_Ph,
        Ext_YN,
        created_date,
        last_modified_date,
        cars (model, make, vin),
        customers (name, email_id, phone_no)
      `)
      .eq('rentals.Inventory_ID', 'cars.Car_ID_Formatted')
      .eq('rentals.Customer_ID', ' Customer_ID_Formatted');

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  addRental,
  getAllRentals
};