const authDebugger = require('debug')('app:auth')

module.exports = function (req, res, next) {
    if (!req.user.isAdmin) {
        authDebugger('Access denied...')
        return res.status(403).send('Access denied.')
    }
    next()
}