const config = require('config')
const jwt = require('jsonwebtoken')
const Joi = require('@hapi/joi')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 

// MongoDB Schema
const userSchema = new Schema({
    id: ObjectId,
    name: { 
        type: String,
        required: true,
        minlength: 2, 
        maxlength: 50
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        minlength: 5, 
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    }, 
    isAdmin: Boolean
})

// This will add a method to the User class. Neat!
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'))
    return token
}

// Course Class
const User = mongoose.model('User', userSchema)

// Validation=====================================================================

function validateUser(user) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(50).email().required(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(user);
}

module.exports.User = User
module.exports.validate = validateUser