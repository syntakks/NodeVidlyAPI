const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 
const { genreSchema } = require('./genre')

// MongoDB Schema
const movieSchema = new Schema({
    id: ObjectId,
    title: { 
        type: String,
        required: true,
        trim: true,
        minlength: 5, 
        maxlength: 255
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number, 
        required: true,
        min: 0,
        max: 255
    },
    dailyRentalRate: {
        type: Number, 
        required: true,
        min: 0,
        max: 255
    }
})

// Course Class
const Movie = mongoose.model('Movie', movieSchema)

// Validation=====================================================================

function validateMovie(movie) {
    const schema = Joi.object({
        id: Joi.number(),
        title: Joi.string().min(3).max(50).required(),
        genreId: Joi.string().required(),
        numberInStock: Joi.number().min(0).required(),
        dailyRentalRate: Joi.number().min(0).required()
    });
    return schema.validate(movie);
}

module.exports.Movie = Movie
module.exports.validate = validateMovie