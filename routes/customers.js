const auth = require('../middleware/authorize')
const dbDebugger = require('debug')('app:db')
const { Customer, validate } = require('../models/customer')
const express = require('express')
const router = express.Router()

// Web Methods======================================================================

// GET All Customers
router.get('/', async (req, res) => {
    dbDebugger('GET All Customers')
    const customers = await Customer.find().sort('name')
    .then(customers => {
        dbDebugger(customers)
        res.send(customers)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('GET Paginated Customers:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const customers = await Customer
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .then(customers => {
        dbDebugger(customers)
        return res.send(customers)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET Customer By ID
router.get('/:id', async (req, res) => {
    dbDebugger('GET Customer by ID:')
    const customer = await Customer.findById(req.params.id)
        .then(customer => {
            if (!customer){
                dbDebugger('ERROR: (404) The customer with the given ID was not found...')
                return res.status(404).send('The customer with Given ID was not found.')
            } 
            dbDebugger(customer)
            return res.send(customer)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Create Customer
router.post('/', auth, async (req, res) => {
    dbDebugger('POST Creating Customer in Database...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    let customer = new Customer(
            { 
                name: req.body.name,
                phone: req.body.phone,
                isGold: req.body.isGold
            }
        )
    customer = await customer.save()
        .then(customer => {
            dbDebugger(customer)
            return res.send(customer)
        })
        .catch(err => {
            dbDebugger('--ERROR: (503) Database Error...' + err.message)
            return res.status(503).send('Database Error...' + err.message)
        })
})

// PUT Update Customer
router.put('/:id', auth, async (req, res) => {
    dbDebugger('PUT Updating Customer...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        { 
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold,
            $inc: { __v: 1 } 
        }, 
        { new: true }
    )
    .then(customer => {
        if (!customer){
            dbDebugger('--ERROR: (404) The customer with the given ID was not found...')
            return res.status(404).send('The customer with Given ID was not found.')
        } 
        dbDebugger(customer)
        return res.send(customer)
    }) 
    .catch(err => {
        dbDebugger('--ERROR: (400) Bad Request...' + err.message)
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove Genre
router.delete('/:id', auth, async (req, res) => {
    dbDebugger('DELETE Deleting Customer')
    const customer = await Customer.findByIdAndRemove(req.params.id)
        .then(customer => {
            if (!customer){
                dbDebugger('--ERROR: (404) The customer with the given ID was not found...')
                return res.status(404).send('The customer with Given ID was not found.')
            }
            dbDebugger(customer)
            return res.send(customer)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router