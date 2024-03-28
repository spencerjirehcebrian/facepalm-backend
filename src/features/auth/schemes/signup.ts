import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Username must be more than 4 characters',
    'string.max': 'Username must be less than 16 characters',
    'string.empty': 'Username is a required feild'
  }),
  password: Joi.string().required().min(4).max(16).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Password must be more than 4 characters',
    'string.max': 'Password must be less than 16 characters',
    'string.empty': 'Password is a required feild'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Invalid email format',
    'string.empty': 'Email is a required feild'
  }),
  avatarColor: Joi.string().required().min(4).max(16).messages({
    'any.required': 'Avatar Color is a required feild'
  }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar Image is a required feild'
  })
});

export { signupSchema };
