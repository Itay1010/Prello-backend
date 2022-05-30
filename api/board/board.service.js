const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    const PAGE = 4
    try {
        const criteria = _buildCriteria(filterBy)
        const pageSkip = filterBy.page - 1 === 0 ? 0 : (+filterBy.page - 1) * PAGE
        const collection = await dbService.getCollection('board')
        // const boards = await collection.find(criteria).skip(pageSkip).limit(PAGE).toArray()
        const boards = await collection.find(criteria).toArray()
        const boardMinis = boards.map(board => {
            return { _id: board._id, title: board.title, createdBy: { ...board.createdBy }, style: board.style }
        })
        return boardMinis
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        const addedCar = await collection.insertOne(board)
        return addedCar
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}
async function update(board) {
    try {
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        return board
    } catch (err) {
        logger.error(`cannot update board ${boardId}`, err)
        throw err
    }
}

function _buildCriteria({ txt, label, page = 1 }) {
    const criteria = {}
    const pageSkip = 4
    const reg = { $regex: txt, $options: 'i' }
    page = +page
    if (txt) criteria.title = reg
    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}