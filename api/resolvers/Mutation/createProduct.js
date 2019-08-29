const { verifyAuthToken } = require('../../auth')
const insertProduct = require('../../db/Product/insertProduct')

module.exports = async(obj, { token, productData }, context) => {
  const payload = verifyAuthToken(token)
  // admin only
  if (!payload.a) throw new Error('Not authorized')
  return await insertProduct(productData)
}
