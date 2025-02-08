const { supabase } = require('../supabase');

const getAllCars = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*');

    if (error) throw error;

    const formattedData = data.map(car => ({
      ...car,
      procure_date: car.procure_date ? new Date(car.procure_date).toISOString().split('T')[0] : null,
      ready_date: car.ready_date ? new Date(car.ready_date).toISOString().split('T')[0] : null,
      sales_date: car.sales_date ? new Date(car.sales_date).toISOString().split('T')[0] : null
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const addCar = async (req, res) => {
  try {
    const requiredFields = [
      'vin', 'model', 'make', 'color', 'odo',
      'source', 'src_name', 'purpose', 'status',
      'buying_price', 'sales_tax', 'retail_price',
      'wholesale_price', 'procure_date'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate prices
    if (req.body.retail_price < req.body.buying_price) {
      throw new Error('Retail price must be greater than buying price');
    }
    if (req.body.wholesale_price < req.body.buying_price) {
      throw new Error('Wholesale price must be greater than buying price');
    }

    const { data, error } = await supabase
      .from('cars')
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
        success: true,
        data: data,
        showConfirmation: true,
        message: 'Car added successfully'
      });
      
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error('Car ID is required');
    }

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('car_id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('car_id', id)
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

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('cars')
      .update(req.body)
      .eq('car_id', id)
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


module.exports = {
  getAllCars,
  addCar,
  deleteCar,
  getCarById,
  updateCar
};