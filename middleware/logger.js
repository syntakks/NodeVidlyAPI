// Custom Middleware. Must call next() or our middleware will be left hanging. 
function log(req, res, next) {
    console.log('Logging...')
    next()
}

module.exports = log