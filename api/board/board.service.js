const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query() {
    try {
        const collection = await dbService.getCollection('board')
        const boards = await collection.find({}).toArray()
        const boardMinis = boards.map(board => {

            return { _id: board._id, title: board.title, createdBy: { ...board.createdBy }, style: board.style, isStarred: board.isStarred, createdAt: board.createdAt }
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
        const boardToAdd =
        {
            title: board.title,
            createdAt: Date.now(),
            isStarred: board.isStarred,
            createdBy: board.creator,
            style: { background: board.backgroundOption, backgroundColor: board.backgroundColor },
            lastVisit: board.lastVisit,
            labels: [
                {
                    id: 'l101',
                    title: 'Done',
                    color: '#61bd4f'
                },
                {
                    id: 'l102',
                    title: 'Progress',
                    color: '#61bd33'
                }
            ],
            members: [board.creator],
            groups: [],
            activities: [],
            cmpsOrder: [
                "status-picker",
                "member-picker",
                "date-picker"
            ]
        }



        const collection = await dbService.getCollection('board')
        const addedBoard = await collection.insertOne(boardToAdd)

        return addedBoard.ops
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}
async function update(board) {

    try {
        const id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        return board
    } catch (err) {
        logger.error(`cannot update board ${boardId}`, err)
        throw err
    }
}

async function updateMini(board) {
    try {
        const id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')

        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id

        return board
    } catch {

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
    query,
    getById,
    remove,
    add,
    update,
    updateMini
}