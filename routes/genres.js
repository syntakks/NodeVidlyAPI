const auth = require('../middleware/authorize')
const admin = require('../middleware/admin')
const dbDebugger = require('debug')('app:db')
const { Genre, validate } = require('../models/genre')
const express = require('express')
const router = express.Router()

// Web Methods======================================================================

// GET All Genres
router.get('/', async (req, res) => {
    dbDebugger('GET All Genres:')
    const genres = await Genre.find().sort('name')
    .then(genres => {
        res.send(genres)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('GET Paginated Genres:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const genres = await Genre
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .then(genres => {
        return res.send(genres)
    })
    .catch(err => {
        dbDebugger('--ERROR: (503) Database Error...' + err.message)
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET Genre By ID
router.get('/:id', async (req, res) => {
    dbDebugger('GET Genre by ID:')
    const genre = await Genre.findById(req.params.id)
        .then(genre => {
            if (!genre){
                dbDebugger('ERROR: (404) The genre with the given ID was not found...')
                return res.status(404).send('The genre with Given ID was not found.')
            } 
            dbDebugger(genre)
            return res.send(genre)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Create Genre
router.post('/', [auth, admin],  async (req, res) => {
    dbDebugger('POST Creating Genre in Database...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    let genre = new Genre({ name: req.body.name })
    genre = await genre.save()
        .then(genre => {
            dbDebugger(genre)
            return res.send(genre)
        })
        .catch(err => {
            dbDebugger('--ERROR: (503) Database Error...' + err.message)
            return res.status(503).send('Database Error...' + err.message)
        })
})

// PUT Update Genre
router.put('/:id', [auth, admin], async (req, res) => {
    dbDebugger('PUT Updating Genre...')
    const { error, value } = validate(req.body)
    if (error) {
        dbDebugger('--ERROR: (400) Bad Request...' + error.message)
        return res.status(400).send(error.message)
    } 
    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name, $inc: { __v: 1 } }, 
        { new: true }
    )
    .then(genre => {
        if (!genre){
            dbDebugger('--ERROR: (404) The genre with the given ID was not found...')
            return res.status(404).send('The genre with Given ID was not found.')
        } 
        dbDebugger(genre)
        return res.send(genre)
    }) 
    .catch(err => {
        dbDebugger('--ERROR: (400) Bad Request...' + err.message)
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove Genre
router.delete('/:id', [auth, admin], async (req, res) => {
    dbDebugger('DELETE Deleting Genre')
    const genre = await Genre.findByIdAndRemove(req.params.id)
        .then(genre => {
            if (!genre){
                dbDebugger('--ERROR: (404) The genre with the given ID was not found...')
                return res.status(404).send('The genre with Given ID was not found.')
            }
            dbDebugger(genre)
            return res.send(genre)
        })
        .catch(err => {
            dbDebugger('--ERROR: (400) Bad Request...' + err.message)
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router