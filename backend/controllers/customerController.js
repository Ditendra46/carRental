const { supabase } = require('../supabase');
const {sendEmail} = require('../utils/sendEmail');

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
    const { email_id, phone_no, name } = req.body;

    // Check for existing email
    const { data: emailData, error: emailError } = await supabase
      .from('customers')
      .select('*')
      .eq('email_id', email_id);

    if (emailError) throw emailError;
    if (emailData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check for existing phone number
    const { data: phoneData, error: phoneError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_no', phone_no);

    if (phoneError) throw phoneError;
    if (phoneData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Insert new customer
    const { data, error } = await supabase
      .from('customers')
      .insert(req.body)
      .select();

    if (error) throw error;

    // Send email to the user
    const subject = 'Welcome to Car Rental';
    const replacements = { name };

    sendEmail(email_id, subject, 'welcomeEmail', replacements);

    res.status(201).json({
      success: true,
      data: data,
      message: 'Customer added successfully'
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
    const { email_id, phone_no } = req.body;

    // Check for existing email
    const { data: emailData, error: emailError } = await supabase
      .from('customers')
      .select('*')
      .eq('email_id', email_id)
      .neq('customer_id', id); // Exclude the current customer

    if (emailError) throw emailError;
    if (emailData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check for existing phone number
    const { data: phoneData, error: phoneError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_no', phone_no)
      .neq('customer_id', id); // Exclude the current customer

    if (phoneError) throw phoneError;
    if (phoneData.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Update customer
    const { data, error } = await supabase
      .from('customers')
      .update(req.body)
      .eq('customer_id', id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getCustomerByPhno = async (req, res) => {
  try {
    const { phno } = req.params;
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