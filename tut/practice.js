// Define the port with environment variables
// export PORT=<your port number>
const Joi = require('@hapi/joi');
const express = require('express')
const app = express()
// Allows for json parsing in the request body. Middleware
app.use(express.json())

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' }
]

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/api/courses', (req, res) => {
    res.send(courses)
})

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id))
    // 404 Resource not found
    if (!course) return res.status(404).send('The course with the given id was not found.')
    // Success
    res.send(course)
})

app.get('/api/posts/:year/:month', (req, res) => {
    console.log(`Params: ${req.params.year}/${req.params.month}`)
    console.log(`Query: ${req.query}`)
    res.send(req.params)
})

// Create post
app.post('/api/courses/', (req, res) => {
    // Validate
    const { error, value } = validateCourse(req.body)
    // 400 Bad Request
    if (error) return res.status(400).send(error.message)
    
    const course = {
        id: courses.length + 1,
        name: req.body.name
    }
    courses.push(course)
    res.send(course)
})

// Update 
app.put('/api/courses/:id', (req, res) => {
    // Look up the course by ID 
    // If not existing return 404 
    const course = courses.find(c => c.id === parseInt(req.params.id))

    // 404 Resource Not Found
    if (!course) return res.status(404).send('The course with the given id was not found.')

    // Validate
    const { error, value } = validateCourse(req.body)
    // 400 Bad Request
    if (error) return res.status(400).send(error.message)

    // Update the course 
    // Return teh updated course. 
    course.name = req.body.name
    res.send(course)
})

app.delete('/api/courses/:id', (req, res) => {
    // Get a course
    const course = courses.find(c => c.id === parseInt(req.params.id))
    // 404 Resource Not Found
    if (!course) return res.status(404).send('The course with the given id was not found.')
       
    //Delete the course.d
    const index = courses.indexOf(course)
    courses.splice(index, 1)
    //Return deleted course
    res.send(course)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

function validateCourse(course) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required()
    });

    return schema.validate(course);
}
