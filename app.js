// Define the port with environment variables
// export PORT=<your port number>
const Joi = require('@hapi/joi');
const express = require('express')
const app = express()
// Allows for json parsing in the request body. Middleware
app.use(express.json())

const genres = [
    { id: 1, name: 'horror' },
    { id: 2, name: 'action' },
    { id: 3, name: 'romance' },
    { id: 4, name: 'comedy' },
    { id: 5, name: 'thriller' },
    { id: 6, name: 'suspence' },
    { id: 7, name: 'documentary' },
    { id: 8, name: 'drama' },
    { id: 9, name: 'musical' },
    { id: 10, name: 'sci-fi' }
]

// Home
app.get('/', (req, res) => {
    res.send('Genre Enpoint')
})

// Get all Genres
app.get('/api/genres', (req, res) => {
    res.send(genres)
})

// Get Genre By ID
app.get('/api/genres/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id))
    // 404 Resource not found
    if (!genre) return res.status(404).send('The genre with the given id was not found.')
    // Success
    res.send(genre)
})

// Create Genre
app.post('/api/genres/', (req, res) => {
    // Validate
    const { error, value } = validateGenre(req.body)
    // 400 Bad Request
    if (error) return res.status(400).send(error.message)
    
    const genre = {
        id: genres.length + 1,
        name: req.body.name
    }
    genres.push(genre)
    res.send(genre)
})

// Update 
app.put('/api/genres/:id', (req, res) => {
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

app.delete('/api/genres/:id', (req, res) => {
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

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

function validateGenre(genre) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required()
    });

    return schema.validate(genre);
}