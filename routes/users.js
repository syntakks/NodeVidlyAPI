const _ = require('lodash')
const { hash } = require('../hash')
const dbDebugger = require('debug')('app:db')
const { User, validate } = require('../models/user')
const express = require('express')
const router = express.Router()

// Web Methods======================================================================

// GET All Users
router.get('/', async (req, res) => {
    dbDebugger('GET All User')
    const users = await User.find().sort('name')
    .then(users => {
        dbDebugger(users)
        res.send(users)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('GET Paginated Users:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const users = await User
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .then(users => {
        dbDebugger(users)
        return res.send(users)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET User By ID
router.get('/:id', async (req, res) => {
    dbDebugger('GET User by ID:')
    const user = await User.findById(req.params.id)
        .then(user => {
            if (!user){
                dbDebugger('ERROR: (404) The user with the given ID was not found...')
                return res.status(404).send('The user with Given ID was not found.')
            } 
            dbDebugger(user)
            return res.send(user)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Register User
router.post('/', async (req, res) => {
    dbDebugger('POST Register User...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        dbDebugger('--ERROR: (400) Bad Request...User already Registered')
        return res.status(400).send('User already registered...')
    }

    user = new User(_.pick(req.body, ['name', 'email', 'password']))
    user.password = await hash(user.password)
    user = await user.save()
        .then(user => {
            dbDebugger(user)
            return res.send(_.pick(user, ['_id', 'name', 'email']))
        })
        .catch(err => {
            dbDebugger('--ERROR: (503) Database Error...' + err.message)
            return res.status(503).send('Database Error...' + err.message)
        })
})

// PUT Update User
router.put('/:id', async (req, res) => {
    dbDebugger('PUT Updating User...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { 
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            $inc: { __v: 1 } 
        }, 
        { new: true }
    )
    .then(user => {
        if (!user){
            dbDebugger('--ERROR: (404) The user with the given ID was not found...')
            return res.status(404).send('The user with Given ID was not found.')
        } 
        dbDebugger(user)
        return res.send(user)
    }) 
    .catch(err => {
        dbDebugger('--ERROR: (400) Bad Request...' + err.message)
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove User
router.delete('/:id', async (req, res) => {
    dbDebugger('DELETE Deleting User')
    const user = await User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (!user){
                dbDebugger('--ERROR: (404) The user with the given ID was not found...')
                return res.status(404).send('The user with Given ID was not found.')
            }
            dbDebugger(user)
            return res.send(user)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router