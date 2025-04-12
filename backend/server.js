const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware and routes
const dateFormatter = require('./middleware/dateFormatter');
const customerRoutes = require('./routes/customerRoutes');
const carRoutes = require('./routes/carRoutes');
const rentalRoutes = require('./routes/rentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


// Initialize express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(dateFormatter);

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    details: err.details || {},
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message,
      code: err.code,
      details: err.details || null
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;