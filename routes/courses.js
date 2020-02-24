const dbDebugger = require('debug')('app:db')
const Joi = require('@hapi/joi')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId 

// MongoDB Schema
const courseSchema = new Schema({
    id: ObjectId,
    name: { 
        type: String,
        required: true,
        minlength: 5, 
        maxlength: 255
        //match: /pattern/ << REGEX
    },
    author: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true,
        enum: ['web', 'mobile', 'network'],
        lowercase: true,
        trim: true // This removes padding spaces on either side of string. Handy!
    },
    // tags: {
    //     type: Array,
    //     validate: {
    //         isAsync: true,
    //         validator: function(v, callback) {
    //             setTimeout(() => {
    //             // Do some async work pretty cool!
    //             const result = v && v.length > 0
    //             callback(result)
    //             }, 1000);
    //         },
    //         message: 'A course should have at least one tag.'
    //     }
    // },
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    price: {
        type: Number,
        required: function() { return this.isPublished },
        min: 10,
        max: 200,
        get: v => Math.round(v),
        set: v => Math.round(v)
    }
})

// Course Class
const Course = mongoose.model('Course', courseSchema)

// HapiJoi Validation=================================================================
function validateCourse(course) {
    const schema = Joi.object({
        id: Joi.number(),
        name: Joi.string().min(3).required(),
        author: Joi.string(),
        category: Joi.string().min(2).max(5).required(),
        tags: Joi.array().items(Joi.string()).required()
    });
    return schema.validate(course);
}

// Web Methods========================================================================

// Get all Courses
router.get('/', (req, res) => {
    dbDebugger('Get All Courses:')
    getAllCourses()
        .then(document => {
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            console.log(err)
            res.status(503).send(err.message)
        })
})

// Pagination
router.get('/:pageNumber/:pageSize', (req, res) => {
    dbDebugger('Get All Courses:')
    getAllCourses(parseInt(req.params.pageNumber), parseInt(req.params.pageSize))
        .then(document => {
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            console.log(err.message)
            res.status(503).send(err.message)
        })
})

// Get Course By ID
router.get('/:id', (req, res) => {
    dbDebugger('Course by ID:')
    getCourseById(req.params.id)
        .then(document => {
            if (!document) {
                dbDebugger('The course with the given id was not found.')
                res.status(404).send('The course with the given id was not found.')
                return
            }
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            console.log(err.message)
            res.status(503).send(err.message)
        })
})

// Create Course
router.post('/', (req, res) => {
    dbDebugger('Creating Course in Database...')
    // Validate
    const { error, value } = validateCourse(req.body)
    // 400 Bad Request
    if (error) {
        dbDebugger(error.message)
        return res.status(400).send(error.message)
    }

    createNewCourse(req)
        .then(document => {
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            console.log(err)
            dbDebugger(err.message)
            res.status(503).send(err.message)
        }) 
})



// Update Course
router.put('/:id', (req, res) => {
    dbDebugger('Updating Course...')
    // Validate
    const { error, value } = validateCourse(req.body)
    // 400 Bad Request
    if (error) {
        dbDebugger(error.message)
        return res.status(400).send(error.message)
    }

    updateCourse(req.params.id, req.body)
        .then(document => {
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            dbDebugger(err.message)
            res.status(404).send(err.message)
        })
})

//TODO Need to catch instance where document is already deleted, n:0 / deletedCount: 0??
router.delete('/:id', (req, res) => {
    dbDebugger('Deleting Course')
    deleteCourse(req.params.id)
        .then(document => {
            dbDebugger(document)
            res.send(document)
        })
        .catch(err => {
            console.log(err)
            console.log(err.message)
            res.status(404).send(err.message)
        })
})

// Database Functions=================================================================

async function getAllCourses(pageNumber = 1, pageSize = 100) {
    const courses = await Course
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    return courses
}

async function getCourseById(id) {
    const course = await Course.findById(id)
    return course
}

async function createNewCourse(req) {
    const course = new Course({
        name: req.body.name,
        category: req.body.category,
        tags: req.body.tags
    })
    const result = await course.save()
    return result
}

async function updateCourse(id, requestBody) {
    const course = await getCourseById(id)
    course.set({
        name: requestBody.name
    })
    course.__v++
    return await course.save()
}

async function deleteCourse(id) {
    return await Course.deleteOne({ _id: id})
}



module.exports = router