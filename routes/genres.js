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
    name: String
})
// Course Class
const Genre = mongoose.model('Genre', genreSchema)

// Get all Genres
router.get('/', (req, res) => {
    getAllGenres()
        .then(document => {
            res.send(document)
        })
        .catch(err => {
            res.status(503).send(err.message)
        })
})

// Get Genre By ID
router.get('/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id))
    // 404 Resource not found
    if (!genre) return res.status(404).send('The genre with the given id was not found.')
    // Success
    res.send(genre)
})

// Create Genre
router.post('/', (req, res) => {
    // Validate
    const { error, value } = validateGenre(req.body)
    // 400 Bad Request
    if (error) return res.status(400).send(error.message)

    createGenre(req)
        .then(document => {
            dbDebugger('Creating Genre in Database...')
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            dbDebugger(err.message)
            res.status(503).send('Database error...Sorry...')
        }) 
})



// Update 
router.put('/:id', (req, res) => {
    // Look up the genre by ID 
    // If not existing return 404 
    const genre = genres.find(g => g.id === parseInt(req.params.id))

    // 404 Resource Not Found
    if (!genre) return res.status(404).send('The genre with the given id was not found.')

    // Validate
    const { error, value } = validateGenre(req.body)
    // 400 Bad Request
    if (error) return res.status(400).send(error.message)

    // Update the genre 
    // Return teh updated genre. 
    genre.name = req.body.name
    res.send(genre)
})

router.delete('/:id', (req, res) => {
    // Get a genre
    const genre = genres.find(g => g.id === parseInt(req.params.id))
    // 404 Resource Not Found
    if (!genre) return res.status(404).send('The genre with the given id was not found.')
       
    //Delete the course.d
    const index = genres.indexOf(genre)
    genres.splice(index, 1)
    //Return deleted course
    res.send(genre)
})

function validateGenre(genre) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required()
    });
    return schema.validate(genre);
}

async function getAllGenres() {
    const genres = await Genre.find()
    dbDebugger(genres)
    return genres
}

async function createGenre(req) {
    const genre = new Genre({
        name: req.body.name
    })
    const result = await genre.save()
    return result
}



module.exports = router