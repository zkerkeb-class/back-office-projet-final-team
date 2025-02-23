const Joi = require('joi');
const { GENRE } = require('../../models/enums');

const artistSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),

  genre: Joi.array()
    .items(Joi.string().valid(...Object.values(GENRE)))
    .required()
    .messages({
      'any.required': 'Genre is required',
      'any.only': 'Invalid genre',
    }),

  country: Joi.string().min(2).max(100).allow('', null).messages({
    'string.min': 'Country must be at least 2 characters',
    'string.max': 'Country cannot exceed 100 characters',
  }),

  bio: Joi.string().allow('', null),
  phonetic_name: Joi.string().allow('', null),
});

module.exports = {
  artistSchema,
};
