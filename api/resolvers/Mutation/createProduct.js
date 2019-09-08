const { verifyAuthTokenAsync } = require('../../auth')
const insertProduct = require('../../db/Product/insertProduct')

module.exports = async(obj, { token, productData }, context) => {
  const payload = await verifyAuthTokenAsync(token)
  // admin only
  if (!payload.a) throw new Error('Not authorized')
  return await insertProduct(productData)
}
