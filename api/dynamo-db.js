const AWS = require('./aws')
const dynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' })
module.exports = dynamoDB
