import Joi, { ObjectSchema } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Invalid email format',
    'string.empty': 'Email is a required field'
  })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password must be more than 4 characters',
    'string.max': 'Password must be less than 16 characters',
    'string.empty': 'Password is a required field'
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm Password is a required feild'
  })
});

export { emailSchema, passwordSchema };
