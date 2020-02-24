const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 

// MongoDB Schema
const genreSchema = new Schema({
    id: ObjectId,
    name: { 
        type: String,
        required: true,
        minlength: 5, 
        maxlength: 50
    }
})

// Course Class
const Genre = mongoose.model('Genre', genreSchema)

// Validation=====================================================================

function validateGenre(genre) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required()
    });
    return schema.validate(genre);
}

module.exports.Genre = Genre
module.exports.validate = validateGenre
module.exports.genreSchema = genreSchema