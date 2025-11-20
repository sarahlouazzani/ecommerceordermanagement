const Joi = require('joi');

const clientSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).optional()
});

exports.validateClient = (req, res, next) => {
  const { error } = clientSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation échouée',
      details: error.details.map(d => d.message)
    });
  }
  
  next();
};
