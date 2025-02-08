const { supabase } = require('../supabase');

const addRental = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rental')
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
  addRental
};