
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getUserByEmail,
    remove,
    update,
    add
}

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find({}).toArray()
        users = users.map(user => {
            delete user.password
            delete user.googleId
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}
async function getUserByEmail(email) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        logger.error(`while finding user ${email}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable fields!
        const userToSave = {
            _id: ObjectId(user._id),
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            color: user.color,
            imgUrl: user.imgUrl
        }
        const collection = await dbService.getCollection('user')
        const { modifiedCount } = await collection.updateOne({ '_id': userToSave._id }, { $set: userToSave })
        return modifiedCount;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    console.log('add - insertedId', user)
    try {
        // peek only updatable fields!
        const userToAdd = {
            email: user.email,
            password: user.password || null,
            firstName: user.firstName,
            lastName: user.lastName,
            color: user.color,
            googleId: user.googleId || null,
            imgUrl: user.imgUrl || null
        }
        if (userToAdd.password === null) delete userToAdd.password
        else delete userToAdd.googleId

        const collection = await dbService.getCollection('user')
        const { insertedId } = await collection.insertOne(userToAdd)
        userToAdd._id = insertedId
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance }
    }
    return criteria
}


