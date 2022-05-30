const Cryptr = require('cryptr')

const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

const cryptr = new Cryptr(process.env.SECRET1 || 'Secret-Puk-1234')

async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getUserByEmail(username)
    const specialPass = await encrypt.hash(password)
    console.log('specialPass', specialPass);
    if (!user) return Promise.reject('Invalid username or password')
    // TODO: un-comment for real login
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid username or password')

    delete user.password
    // delete user._id
    return user
}

async function signup(username, password, firstName, lastName, color, email, googleId = '') {

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !firstName || !color || !email) return Promise.reject('fullname, username and password are required!')

    const hash = await bcrypt.hash(password)
    return userService.add({ username, password: hash, firstName, lastName, color, email, googleId })
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