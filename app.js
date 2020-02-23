// Define the port with environment variables
// export PORT=<your port number>
const config = require('config')
const helmet = require('helmet')
// Different debuggers, export DEBUG=<namespace> comma separated, * for all, empty for none.
const startupDebugger = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const morgan = require('morgan')
// Routes
const home = require('./routes/home')
const genres = require('./routes/genres')

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
  useUnifiedTopology: true
});


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
