const Joi = require('joi');

// Define the schema for a listing
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().min(3),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.string().uri().allow(""),
        category: Joi.string().required() 
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required()
});