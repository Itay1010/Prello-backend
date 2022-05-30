const express = require('express')
const { login, signup, logout } = require('./auth.controller')

const router = express.Router()

router.post('auth/login', login)
router.post('auth/signup', signup)
router.post('auth/logout', logout)

module.exports = router