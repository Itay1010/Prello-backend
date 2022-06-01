const authService = require('./auth.service')
const logger = require('../../services/logger.service')
const cookieParser = require('cookie-parser')


async function login(req, res) {
    const credentials = req.body
    try {
        const user = await authService.login(credentials)
        const loginToken = authService.getLoginToken(user)
        logger.info('User login: ', user)
        res.cookie('loginToken', cookieParser.JSONCookies(loginToken), { maxAge: 1000 * 60 * 60 * 24 })
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    // logger.debug('signup - credentials', req.body)
    try {
        const credentials = req.body
        // Never log passwords
        const account = await authService.signup(credentials)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        delete account.password
        const loginToken = authService.getLoginToken(account)
        logger.info('User login: ', account)

        res.cookie('loginToken', cookieParser.JSONCookies(loginToken), { maxAge: 1000 * 60 * 60 * 24 })
        res.json(account)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}