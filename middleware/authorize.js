const jwt = require('jsonwebtoken')
const config = require('config')
const authDebugger = require('debug')('app:auth')

function auth(req, res, next) {
    const token = req.header('x-auth-token')
    if (!token) {
        authDebugger('Access Denied. No token provided.')
        return res.status(401).send('Access Denied. No token provided.')
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        req.user = decoded
        next()
    }
    catch (ex) {
        authDebugger('Invalid Token...')
        res.status(400).send('Invalid Token')
    }
}

module.exports = auth