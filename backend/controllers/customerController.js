const { supabase } = require('../supabase');

const getAllCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');

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

const addCustomer = async (req, res) => {
  try {
    const requiredFields = [
      'name', 'email_id', 'phone_no', 'add_1',
      'city', 'state', 'zipcd', 'dl_no'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
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
  getAllCustomers,
  addCustomer
};