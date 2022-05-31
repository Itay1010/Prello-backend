const Cryptr = require('cryptr')

const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(email, password) {
    logger.debug(`auth.service - login with email: ${email}`)
    const user = await userService.getUserByEmail(email)
    if (!user) return Promise.reject('Invalid email or password')
    // TODO: un-comment for real login
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid email or password')

    delete user.password
    user._id = user._id.toString()
    return user
}

async function signup(email, password, firstName, lastName, color) {
    const saltRounds = 10
    logger.debug(`auth.service - signup with email: ${email}, fullname: ${firstName} ${lastName}`)

    if (!email || !password || !firstName || !lastName || !color)
        return Promise.reject('all form fields are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ email, password: hash, firstName, lastName, color })
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