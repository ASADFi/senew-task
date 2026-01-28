const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Validation schemas
const schemas = {
  createProduct: Joi.object({
    name: Joi.string().required().trim().min(1).max(200),
    sku: Joi.string().required().trim().min(1).max(100),
    description: Joi.string().optional().trim().max(1000),
    price: Joi.number().required().min(0),
    totalStock: Joi.number().required().integer().min(0),
  }),

  updateProduct: Joi.object({
    name: Joi.string().optional().trim().min(1).max(200),
    description: Joi.string().optional().trim().max(1000),
    price: Joi.number().optional().min(0),
    isFlashDeal: Joi.boolean().optional(),
  }),

  reserveProducts: Joi.object({
    userId: Joi.string().required().trim(),
    items: Joi.array().required().min(1).items(
      Joi.object({
        productId: Joi.string().required().trim(),
        sku: Joi.string().required().trim(),
        quantity: Joi.number().required().integer().min(1),
      })
    ),
  }),

  checkout: Joi.object({
    userId: Joi.string().required().trim(),
  }),

  cancelReservation: Joi.object({
    userId: Joi.string().required().trim(),
  }),

  userId: Joi.object({
    userId: Joi.string().required().trim(),
  }),
};

module.exports = { validate, schemas };
