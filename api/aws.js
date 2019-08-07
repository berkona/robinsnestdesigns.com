const aws = require('aws-sdk')

if (!process.env.AWSAccessKeyId || !process.env.AWSSecretKey)
  throw new Error('set AWSAccessKeyId and AWSSecretKey in environment')

// Configure aws with your accessKeyId and your secretAccessKey
aws.config.update({
  region: 'us-east-1', // Put your aws region here
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey
})

module.exports = aws
