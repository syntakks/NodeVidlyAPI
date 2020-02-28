// Define the port with environment variables
// export PORT=<your port number>
// Must export development settings and app_password to run this application
const config = require('config')
const helmet = require('helmet')
// Different debuggers, export DEBUG=<namespace> comma separated, * for all, empty for none.
const startupDebugger = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const morgan = require('morgan')
// Routes
const home = require('./routes/home')
const genres = require('./routes/genres')
const customers = require('./routes/customers')
const movies = require('./routes/movies')
const rentals = require('./routes/rentals')
const users = require('./routes/users')
const auth = require('./routes/auth')
const courses = require('./routes/courses')

// Express
const express = require('express')
const app = express()

// Mongoose
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

// Templating 
app.set('view engine', 'pug')
app.set('views', './views') // Default location for template view files. 

// Allows for json parsing in the request body. Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // converts urlencoded to json in req.body
app.use(express.static('public')) // Static assets in this folder, localhost:port/<filename>

// HTTP Header Security
app.use(helmet()) 

// Use routes 
app.use('/', home)
app.use('/api/genres/', genres)
app.use('/api/customers/', customers)
app.use('/api/movies/', movies)
app.use('/api/rentals/', rentals)
app.use('/api/users/', users)
app.use('/api/auth/', auth)
app.use('/api/courses/', courses)

// Configuration 
console.log(`Application Name: ${config.get('name')}`)
console.log(`Mail Server: ${config.get('mail.host')}`)
console.log(`Mail Password: ${config.get('mail.password')}`)

// Morgan Logging
// Can alter NODE_ENV with export to change to production. Development by default. 
if (app.get('env') === 'development') {
    app.use(morgan('tiny'))
    startupDebugger('Morgan Enabled')
}
app.use(morgan('tiny'))

// Database
mongoose.connect('mongodb://localhost/playground', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
})
  .then(() => dbDebugger("Connected to MongoDB..."))
  .catch(() => dbDebugger("Could not connect to MongoDB..."));

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
