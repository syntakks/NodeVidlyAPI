// Mongoose
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

// Connect
// Database
mongoose.connect('mongodb://localhost/playground', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// MongoDB Schema
const genreSchema = new Schema({
    id: ObjectId,
    name: String,
    author: String,
    tags: [ String ], 
    date: { type: Date, default: Date.now },
    isPublished: Boolean
})
// Course Class
const Genre = mongoose.model('Genre', genreSchema)

async function createGenre() {
    const genre = new Genre({
        name: "Some Genre",
        author: 'author',
        tags: ['Some', 'Tags', 'Here'], 
        isPublished: true
    })

    genre.save((err, genre) => {
        console.log('Saving Genre')
        if (err) return console.error(err)
        console.log(genre)
    })
}

createGenre().catch(err => console.log(err.message))