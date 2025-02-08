const dateFormatter = (req, res, next) => {
    console.log(req.body);
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (key.toLowerCase().includes('date') && req.body[key]) {
          req.body[key] = new Date(req.body[key]).toISOString().split('T')[0];
          console.log(req.body);
        }
      });
    }
    next();
  };
  
  module.exports = dateFormatter;