const { getImage } = require('../utils')
const getCategoryImage = require('../db/Category/getCategoryImage')
const updateCategory = require('../db/Category/updateCategory')

module.exports = {
  image: (obj, args, context) => obj && obj.image || getImage(
    () =>  getCategoryImage(obj.id),
    (image) => updateCategory(obj.id, { image, }),
    {
      categoryId: obj.id,
      sortOrder: 'mostRecent',
    }
  ),
}
