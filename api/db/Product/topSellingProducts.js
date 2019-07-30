const getAllProducts = require('./getAllProducts')
const { knex, readDB } = require('../db')

module.exports = async (after, limit) => {
  after = after || Date.now() - 30 * 24 * 60 * 60 * 1000
  limit = limit || 8
  const query = knex
    .select('Products.ID')
    .from(
      knex
        .select('ItemID')
        .sum('Quantity as totalSold')
        .from('Cart')
        .where('Date', '>', new Date(after).toISOString())
        .groupBy('ItemID')
        .as('t1')
    )
    .innerJoin('Products', 'Products.ItemID', 't1.ItemID')
    .where('Active', 1)
    .orderBy('totalSold', 'desc')
    .limit(limit)
  return await getAllProducts(query, limit)
}
