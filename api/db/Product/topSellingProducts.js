const productFields = require('./productFields')
const { knex, readDB } = require('../db')
const reduceProduct = require('../../reducers/reduceProduct')

module.exports = async (after, limit) => {
  after = after || Date.now() - 30 * 24 * 60 * 60 * 1000
  limit = limit || 8

  const query = knex
    .select(productFields)
    .from(
      knex
        .select('Cart.ItemID')
        .sum('Cart.Quantity as totalSold')
        .from('CustomerInfo')
        .innerJoin('Cart')
        .where('CustomerInfo.Date', '>', new Date(after).toISOString())
        .groupBy('ItemID')
        .as('t1')
    )
    .innerJoin('Products', 'Products.ItemID', 't1.ItemID')
    .innerJoin('Category', 'Products.Category', 'Category.ID')
    .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
    .where('Products.Active', 1)
    .orderBy('totalSold', 'desc')
    .limit(limit)

  const result = await readDB(query, 'Products')
  return result.map(reduceProduct)
}
