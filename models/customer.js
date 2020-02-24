const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 

// MongoDB Schema
const customerSchema = new Schema({
    id: ObjectId,
    name: { 
        type: String,
        required: true,
        minlength: 5, 
        maxlength: 50
    },
    phone: { 
        type: String,
        required: true,
        minlength: 7, 
        maxlength: 20
    },
    isGold: {
        type: Boolean,
        required: true,
        default: false
    }
})

// Course Class
const Customer = mongoose.model('Customer', customerSchema)

// Validation=====================================================================

function validateCustomer(customer) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required(),
        isGold: Joi.boolean().required(),
        phone: Joi.string().min(7).max(20).required()
    });
    return schema.validate(customer);
}

module.exports.Customer = Customer
module.exports.validate = validateCustomer