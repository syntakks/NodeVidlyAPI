const dbDebugger = require('debug')('app:db')
const { Movie, validate } = require('../models/movie')
const { Genre } = require('../models/genre')
const express = require('express')
const router = express.Router()

// Web Methods======================================================================

// GET All Movies
router.get('/', async (req, res) => {
    dbDebugger('GET All Movies')
    const movies = await Movie.find().sort('name')
    .then(movies => {
        dbDebugger(movies)
        res.send(movies)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('GET Paginated Movies:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const movies = await Movie
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .then(movies => {
        dbDebugger(movies)
        return res.send(movies)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET Movie By ID
router.get('/:id', async (req, res) => {
    dbDebugger('GET Movie by ID:')
    const movie = await Movie.findById(req.params.id)
        .then(movie => {
            if (!movie){
                dbDebugger('ERROR: (404) The movie with the given ID was not found...')
                return res.status(404).send('The movie with Given ID was not found.')
            } 
            dbDebugger(movie)
            return res.send(movie)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Create Movie
router.post('/', async (req, res) => {
    dbDebugger('POST Creating Movie in Database...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 

    const genre = await Genre.findById(req.body.genreId)
    if (!genre) {
        dbDebugger('--ERROR: Invalid Genre')
        return res.status(400).send('Invalid Genre...')
    }

    let movie = new Movie(
            { 
                title: req.body.title,
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: req.body.numberInStock,
                dailyRentalRate: req.body.dailyRentalRate
            }
        )
    movie = await movie.save()
        .then(movie => {
            dbDebugger(movie)
            return res.send(movie)
        })
        .catch(err => {
            dbDebugger('--ERROR: (503) Database Error...' + err.message)
            return res.status(503).send('Database Error...' + err.message)
        })
})

// PUT Update Movie
router.put('/:id', async (req, res) => {
    dbDebugger('PUT Updating Movie...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        { 
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold,
            $inc: { __v: 1 } 
        }, 
        { new: true }
    )
    .then(movie => {
        if (!movie){
            dbDebugger('--ERROR: (404) The customer with the given ID was not found...')
            return res.status(404).send('The customer with Given ID was not found.')
        } 
        dbDebugger(movie)
        return res.send(movie)
    }) 
    .catch(err => {
        dbDebugger('--ERROR: (400) Bad Request...' + err.message)
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove Movie
router.delete('/:id', async (req, res) => {
    dbDebugger('DELETE Deleting Movie')
    const movie = await Movie.findByIdAndRemove(req.params.id)
        .then(movie => {
            if (!movie){
                dbDebugger('--ERROR: (404) The movie with the given ID was not found...')
                return res.status(404).send('The movie with Given ID was not found.')
            }
            dbDebugger(movie)
            return res.send(movie)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router