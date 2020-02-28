const _ = require('lodash')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const dbDebugger = require('debug')('app:db')
const authDebugger = require('debug')('app:auth')
const { User } = require('../models/user')
const express = require('express')
const router = express.Router()

// POST Login User
router.post('/', async (req, res) => {
    dbDebugger('POST Register User...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        dbDebugger('--ERROR: (400) Bad Request...No User for this email')
        return res.status(400).send('Invalid Email or Password...')
    }
    const validPasswod = await bcrypt.compare(req.body.password, user.password)
    if (!validPasswod) {
        authDebugger('--ERROR: (400) Bad Request...Password Incorrect')
        return res.status(400).send('Invalid Email or Password...')
    }
    const token = user.generateAuthToken()
    res.send(token)
})

// Validation=====================================================================

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().max(50).email().required(),
        password: Joi.string().max(255).required()
    });
    return schema.validate(user);
}

module.exports = router