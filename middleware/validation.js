const Joi = require("joi");  // Ensure Joi is imported correctly

const validateWith = (schema) => {
  return (req, res, next) => {
    // Validate request body with schema
    const { error } = schema.validate(req.body, { abortEarly: false });  // 'abortEarly: false' shows all validation errors

    if (error) {
      // Format the validation errors as a string or send as an array
      return res.status(400).send({ error: error.details.map(detail => detail.message).join(', ') });
    }

    next();
  };
};

module.exports = validateWith;  // Ensure to export the middleware
