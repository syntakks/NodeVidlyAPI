const dbDebugger = require('debug')('app:db')
const Joi = require('@hapi/joi')
const express = require('express')
const router = express.Router()
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

// Web Methods======================================================================

// GET All Genres
router.get('/', async (req, res) => {
    dbDebugger('Get All Genres:')
    const genres = await Genre.find().sort('name')
    .then(genres => {
        res.send(genres)
    })
    .catch(err => {
        return res.status(503).send('Database Error...' + err.message)
    })
})

// GET Pagination
router.get('/:pageNumber/:pageSize', async (req, res) => {
    dbDebugger('Get All Genres:')
    const pageNumber = parseInt(req.params.pageNumber)
    const pageSize = parseInt(req.params.pageSize)
    const genres = await Genre
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .then(genres => {
        res.send(genres)
    })
    .catch(err => {
        return res.status(503).send('Database Error...' + err.message)
    })
    
})

// GET Genre By ID
router.get('/:id', async (req, res) => {
    dbDebugger('Genre by ID:')
    const genre = await Genre.findById(req.params.id)
        .then(genre => {
            if (!genre){
                dbDebugger('ERROR: The genre with the given ID was not found...')
                return res.status(404).send('The genre with Given ID was not found.')
            } 
            dbDebugger(genre)
            res.send(genre)
        })
        .catch(err => {
            return res.status(400).send('Bad Request...' + err.message)
        })
})

// POST Create Genre
router.post('/', async (req, res) => {
    dbDebugger('Creating Genre in Database...')
    const { error, value } = validateGenre(req.body)
    if (error) return res.status(400).send(error.message)
    let genre = new Genre({ name: req.body.name })
    genre = await genre.save()
        .then(genre => {
            dbDebugger(genre)
            res.send(genre)
        })
        .catch(err => {
            return res.status(503).send('Database Error...' + err.message)
        })
})

// PUT Update Genre
router.put('/:id', async (req, res) => {
    dbDebugger('Updating Genre...')
    const { error, value } = validateGenre(req.body)
    if (error) {
        dbDebugger(error.message)
        return res.status(400).send(error.message)
    } 
    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name, $inc: { __v: 1 } }, 
        { new: true}
    )
    .then(genre => {
        if (!genre){
            dbDebugger('ERROR: The genre with the given ID was not found...')
            return res.status(404).send('The genre with Given ID was not found.')
        } 
        dbDebugger(genre)
        res.send(genre)
    }) 
    .catch(err => {
        return res.status(400).send('Bad Request...' + err.message)
    })
})

// DELETE Remove Genre
router.delete('/:id', async (req, res) => {
    dbDebugger('Deleting Document')
    const genre = await Genre.findByIdAndRemove(req.params.id)
        .then(genre => {
            if (!genre){
                dbDebugger('ERROR: The genre with the given ID was not found...')
                return res.status(404).send('The genre with Given ID was not found.')
            }
            dbDebugger(genre)
            res.send(genre)
        })
        .catch(err => {
            return res.status(400).send('Bad Request...' + err.message)
        })
})

module.exports = router