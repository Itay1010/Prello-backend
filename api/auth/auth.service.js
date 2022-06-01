const Cryptr = require('cryptr')

const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')
const { log } = require('../../middlewares/logger.middleware')

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(credentials) {
    logger.debug(`auth.service - login with email: ${credentials.email}`)
    const user = await userService.getUserByEmail(credentials.email)
    if (!user) return Promise.reject('Invalid email or password')

    let match
    if (user.googleId !== null) match = (credentials.googleId === user.googleId)
    else match = await bcrypt.compare(credentials.password, user.password)
    if (!match) return Promise.reject('Invalid email or password')

    delete user.password
    user._id = user._id.toString()
    return user
}

async function signup(credentials) {
    credentials = JSON.parse(JSON.stringify(credentials))
    const saltRounds = 10
    logger.debug(`auth.service - signup with email: ${credentials.email}`)
    if (!credentials.email) return Promise.reject('all form fields are required!')

    if (credentials.googleId) {
        return userService.add(credentials)
    }
    else if (credentials.password) {
        const hash = await bcrypt.hash(credentials.password, saltRounds)
        credentials.password = hash
        return userService.add(credentials)
    }
}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}



module.exports = {
    signup,
    login,
    getLoginToken,
    validateToken
}