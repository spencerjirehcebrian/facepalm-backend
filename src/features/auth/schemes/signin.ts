import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object().keys({
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
  })
});

export { signinSchema };
