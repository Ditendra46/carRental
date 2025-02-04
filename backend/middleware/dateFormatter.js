const dateFormatter = (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (key.toLowerCase().includes('date') && req.body[key]) {
          req.body[key] = new Date(req.body[key]).toISOString().split('T')[0];
        }
      });
    }
    next();
  };
  
  module.exports = dateFormatter;