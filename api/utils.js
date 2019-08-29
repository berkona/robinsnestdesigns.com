const isOnSale = (obj) => obj.salePrice
  && obj.saleStart
  && obj.saleEnd
  && obj.salePrice > 0
  && IsWithinDateRange(Date.now(), ParseDate(obj.saleStart), ParseDate(obj.saleEnd)) || false

const IsWithinDateRange = (timestamp, rangeStart, rangeEnd) => {
  return timestamp > rangeStart && timestamp < rangeEnd
}

const ParseDate = (dateStr) => {
  const retVal = Number.parseInt(dateStr)
  return Number.isNaN(retVal) ? Date.parse(dateStr) : retVal
}

const listProductsTotal = require('./db/Product/listProductsTotal')
const listProducts = require('./db/Product/listProducts')
const reduceProduct = require('./reducers/reduceProduct')

const getImage = async (storeGetFn, storeSetFn, listProductsArgs) => {
  let image = await storeGetFn()
  if (image) return image
  const [ { nRecords } ] = await listProductsTotal(listProductsArgs)
  for (let skip = 0; skip < nRecords; skip += 50) {
    const products = await listProducts(Object.assign({ skip }, listProductsArgs))
    const product = products.map(reduceProduct).filter(p => p && p.hyperlinkedImage)[0]
    image = product && product.hyperlinkedImage
    if (image) {
      await storeSetFn(image)
      return image
    }
  }
  return null
}

const longestCommonPrefix = (words) => {
  words = words.slice()
  const size = words.length
  if (size == 0) return ""
  if (size == 1) return words[0]
  words.sort()
  const end = Math.min(words[0].length, words[size-1].length)
  let i;
  for (i = 0; i < end && words[0][i] == words[size-1][i]; i++) {
    // noop
  }
  const lcp = words[0].slice(0, i)
  //console.log('longestCommonPrefix', { words, end, size, i, lcp, })
  return lcp
}

if (!process.env.AWSUploadBucket)
    throw new Error('set AWSUploadBucket in environment')

const S3_BUCKET = process.env.AWSUploadBucket

const fetch = require('isomorphic-unfetch')
const mime = require('mime-types')
const uuidv4 = require('uuid/v4')

const AWS = require('./aws')

const uploadFromURL = (url) => new Promise(async (resolve, reject) => {
  try {
    console.log('uploadFromURL', url)
    const response = await fetch(url)
    const data = response.body
    //console.log('got data from url', url, data)
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
    const parts = url.split('.')
    if (parts.length < 2)
      throw new Error('no file extension detected')
    const fileName = uuidv4() + '.' + parts[parts.length-1]
    const fileType = mime.lookup(fileName)
    s3.upload({
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: data,
      ContentType: fileType,
      ACL: 'public-read',
    }, (err, data) => { err || !data ? reject(err || new Error('no data')) : resolve(`https://${S3_BUCKET}/${fileName}`) })
  } catch (err) { reject (err) }
})

module.exports = {
  isOnSale,
  IsWithinDateRange,
  ParseDate,
  getImage,
  longestCommonPrefix,
  uploadFromURL,
}
