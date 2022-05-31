const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getBoards, getBoardById, addBoard, updateMini, removeBoard } = require('./workspace.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

// router.get('/', log, getBoards)
// router.get('/:id', getBoardById)
router.post('/', addBoard)
router.put('/:id', updateMini)
// router.delete('/:id', removeBoard)
// router.post('/', requireAuth, requireAdmin, addBoard)
// router.put('/:id', requireAuth, requireAdmin, updateBoard)
// router.delete('/:id', requireAuth, requireAdmin, removeBoard)


// debug routes
// router.post('/', addBoard)
// router.put('/:id', updateBoard)
// router.delete('/:id', removeBoard)

module.exports = router