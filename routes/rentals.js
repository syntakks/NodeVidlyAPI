const dbDebugger = require('debug')('app:db')
const { Rental, validate } = require('../models/rental')
const { Customer } = require('../models/customer')
const { Movie } = require('../models/movie')
const express = require('express')
const router = express.Router()

// Web Methods======================================================================

// GET All Rentals
router.get('/', async (req, res) => {
    dbDebugger('GET All Rentals')
    const rentals = await Rental.find().sort('-dateOut')
    .then(rentals => {
        dbDebugger(rentals)
        res.send(rentals)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('GET Paginated Rentals:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const rentals = await Rental
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort('-dateOut')
    .then(rentals => {
        dbDebugger(rentals)
        return res.send(rentals)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET Rental By ID
router.get('/:id', async (req, res) => {
    dbDebugger('GET Rental by ID:')
    const rental = await Rental.findById(req.params.id)
        .then(rental => {
            if (!rental){
                dbDebugger('ERROR: (404) The rental with the given ID was not found...')
                return res.status(404).send('The rental with Given ID was not found.')
            } 
            dbDebugger(rental)
            return res.send(rental)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Create Rental
router.post('/', async (req, res) => {
    dbDebugger('POST Creating Rental in Database...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 

    const customer = await Customer.findById(req.body.customerId)
    if (!customer) {
        dbDebugger('--ERROR: Invalid Customer')
        return res.status(400).send('Invalid Customer...')
    }

    const movie = await Movie.findById(req.body.movieId)
    if (!movie) {
        dbDebugger('--ERROR: Invalid Movie')
        return res.status(400).send('Invalid Movie...')
    }

    if (movie.numberInStock === 0) {
        dbDebugger('--ERROR: Movie Out of Stock')
        return res.status(400).send('Movie Out of Stock...')
    }

    let rental = new Rental(
            { 
                customer: {
                    _id: customer._id,
                    name: customer.name,
                    phone: customer.phone,
                    isGold: customer.isGold
                },
                movie: {
                    _id: movie._id,
                    title: movie.title,
                    dailyRentalRate: movie.dailyRentalRate
                }
            }
        )

    Rental.createCollection()
    .then(() => Rental.startSession())
    // The `withTransaction()` function's first parameter is a function
    // that returns a promise.
    .then(session => session.withTransaction(() => {
        return rental.save()
    }))
    .then(() => {
        movie.numberInStock--
        return movie.save()
    })
    .then((movie) => {
        dbDebugger(movie)
        return res.send(movie)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})


// PUT Update Rental
router.put('/:id', async (req, res) => {
    dbDebugger('PUT Updating Rental...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 

    const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        { 
            title: req.body.title,
            genre: {
                _id: genre._id,
                name: genre.name
            },
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }, 
        { new: true }
    )
    .then(rental => {
        if (!rental){
            dbDebugger('--ERROR: (404) The rental with the given ID was not found...')
            return res.status(404).send('The rental with Given ID was not found.')
        } 
        dbDebugger(rental)
        return res.send(rental)
    }) 
    .catch(err => {
        dbDebugger('--ERROR: (400) Bad Request...' + err.message)
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove Rental
router.delete('/:id', async (req, res) => {
    dbDebugger('DELETE Deleting Rental')
    const rental = await Rental.findByIdAndRemove(req.params.id)
        .then(rental => {
            if (!rental){
                dbDebugger('--ERROR: (404) The rental with the given ID was not found...')
                return res.status(404).send('The rental with Given ID was not found.')
            }
            dbDebugger(rental)
            return res.send(rental)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router