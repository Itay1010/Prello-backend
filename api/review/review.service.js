const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
        var reviews = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser'
                }
            },
            {
                $unwind: '$byUser'
            },
            {
                $lookup:
                {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'aboutToy'
                }
            },
            {
                $unwind: '$aboutToy'
            }
        ]).toArray()
        reviews = reviews.map(review => {
            review.byUser = {
                _id: review.userId,
                fullname: review.byUser.fullname,
                username: review.byUser.username
            }

            review.aboutToy = {
                _id: review.aboutToy._id,
                name: review.aboutToy.name,
                price: review.aboutToy.price,
                labels: review.aboutToy.labels,
                inStock: review.aboutToy.inStock
            }

            delete review.toyId
            delete review.userId
            return review
        })
        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        logger.info('removing toy')
        const store = await asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!loggedinUser.isAdmin) criteria.userId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    console.log('add - review', review)
    try {
        let reviewToAdd = {
            userId: ObjectId(review.userId),
            toyId: ObjectId(review.toyId),
            title: review.title,
            description: review.description
        }
        const collection = await dbService.getCollection('review')
        const { insertedId } = await collection.insertOne(reviewToAdd)
        const savedReview = await query({ id: insertedId, type: 'byId' })
        console.log('add - savedReview', savedReview)
        return savedReview[0]
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    switch (filterBy.type) {
        case 'byToy':
            criteria.toyId = ObjectId(filterBy.id)
            break;
        case 'byUser':
            criteria.userId = ObjectId(filterBy.id)
            break;
        case 'byId':
            criteria._id = ObjectId(filterBy.id)
            break
        default:
            break;
    }
    return criteria
}

module.exports = {
    query,
    remove,
    add
}