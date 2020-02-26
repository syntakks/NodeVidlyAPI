const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 

// MongoDB Schema 
const rentalSchema = new Schema({
    id: ObjectId,
    // Not reusing our customer model as it may have many more values. 
    customer: { 
        type: new Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            phone: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50,
            },
            isGold: {
                type: Boolean,
                required: true
            }
        })
    },
    movie: {
        type: new Schema({
            title: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            }
        })
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number, 
        min: 0
    }

})

// Course Class
const Rental = mongoose.model('Rental', rentalSchema)

// Validation=====================================================================

function validateRental(rental) {
    const schema = Joi.object({
        customerId: Joi.string().required(),
        movieId: Joi.string().required()
    });
    return schema.validate(rental);
}

module.exports.Rental = Rental
module.exports.validate = validateRental