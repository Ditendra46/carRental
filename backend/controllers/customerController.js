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

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error('Customer ID is required');
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('customer_id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_id', id)
      .single();

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
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .update(req.body)
      .eq('customer_id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
      message: 'Car updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
const getCustomerByPhno = async (req, res) => {
  console.log('phno:', req.params);

  try {
    const { phno } = req.params;
    console.log('phno:', phno);
    if (!phno) {
      return res.status(400).json({ success: false, message: 'Phone number path parameter is required' });
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .ilike('phone_no', `%${phno}%`)
      .limit(5);

    if (error) throw error;

    res.json({ success: true, data: data.map(customer => customer) });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
module.exports = {
  getAllCustomers,
  addCustomer,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  getCustomerByPhno
};