const getProduct = require('./getProduct')
const productFields = require('./productFields')
const { knex, readDB } = require('../db')
const reduceProduct = require('../../reducers/reduceProduct')

module.exports = async (productId, limit) => {
  if (!productId) throw new Error('productId is required')
  limit = limit || 8

  const [ product ] = await getProduct(productId)
  if (!product) throw new Error('product not found')

  const relatedOrders = knex.select('CustomerID')
                            .from('Cart')
                            .where('ItemID', product.ItemID)

  const relatedItems = knex.select('ItemID').distinct()
                           .from('Cart')
                           .where('CustomerID', 'in', relatedOrders)
                           .where('ItemID', '!=', product.ItemID)

  const query = knex.select(productFields)
      .from(relatedItems.as('Related'))
      .innerJoin('Products', 'Related.ItemID', 'Products.ItemID')
      .innerJoin('Category', 'Products.Category', 'Category.ID')
      .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
      .where('Products.Active', 1)
      .limit(limit)

  const result = await readDB(query, 'Products')
  return result.map(reduceProduct)
}
