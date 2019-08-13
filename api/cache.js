const dynamoDB = require('./dynamo-db')
const stringHash = require("string-hash")

if (!process.env.CacheDynamoDB)
  throw new Error('set CacheDynamoDB in environment')

const CACHE_TABLE_NAME = process.env.CacheDynamoDB

class DynamoDBCache {

  async get(key) {
    console.log('cache get', key)
    const { Item } = await dynamoDB.getItem({ Key: { CacheKey: { S: key } }, TableName: CACHE_TABLE_NAME }).promise()
    if (!Item) {
      console.log('cache miss', key)
      return undefined
    }
    const expiresOn =  Number.parseInt(Item.CacheTTL.S) * 1000
    if (Date.now() >= expiresOn) {
      console.log('cache miss', key)
      return undefined
    }
    const cacheVal =  Item.CacheValue.S
    return cacheVal || undefined
  }

  async set(key, value, { ttl }) {
    console.log('cache set', key, value, ttl)
    return await dynamoDB.putItem({
      Item: {
        CacheKey: { S: key },
        CacheValue: { S: value },
        CacheTTL: { S: '' + (Math.floor(Date.now() / 1000) + ttl) },
      }, TableName: CACHE_TABLE_NAME
    }).promise()
  }

  async delete(key) {
    return await dynamoDB.deleteItem({
      Key: { CacheKey: { S: key } },
    })
  }
}

module.exports = DynamoDBCache
