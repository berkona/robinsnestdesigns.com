const productFields = require('./productFields')
const { knex, readDB } = require('../db')
const reduceProduct = require('../../reducers/reduceProduct')

module.exports = async (ids, limit) => {
  const query = knex.select(productFields)
      .from('Products')
      .innerJoin('Category', 'Products.Category', 'Category.ID')
      .innerJoin('Subcategory', 'Products.SubCategory', 'Subcategory.ID')
      .where('Products.Active', 1)
      .where('Products.ID', 'in', ids)
      .limit(limit)
  const result = await readDB(query, 'Products')
  return result.map(reduceProduct)
}
