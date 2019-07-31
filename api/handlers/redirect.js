const url = require('url')
const { knex, withDB, readDB } = require('../db')

const redirectUrls = [
  {
    src: /\/ShippingInfo\/shipping\.cfm/,
    dest: () => "/ShippingInfo/shipping"
  },
  {
    src: /\/ShippingInfo\/shippingratesnew\.cfm/,
    dest: () => "/ShippingInfo/shippingratesnew"
  },
  {
    src: /\/whats_new\.cfm/,
    dest: () => "/search?onSaleOnly=true&sortOrder=mostRecent"
  },
  {
    src: /\/add_to_cart\.cfm/,
    dest: () => "/cart"
  },
  {
    src: /\/wish_list\.cfm/,
    dest: () => "/wishlist"
  },
  {
    src: /\/Newsletters\/newsletter-signup\.cfm/,
    dest: () => "/subscribe"
  },
  {
    src: /\/search\.cfm/,
    dest: () => "/categories"
  },
  {
    src: /category_results\.cfm\?Category=(\d+)/,
    dest: (_, categoryId) => `/category/${categoryId}`,
  },
  {
    src: /results\.cfm.*/,
    dest: async (url) => {
      const queryStr = url.split('?', 2)[1] || ""
      const queryObj = queryStr.split('&').reduce((a, s) => {
        const [ key, value ] = s.split('=', 2)
        a[key] = value || true
        return a
      }, {})
      const subcategoryId = queryObj.SubCategory
      const startRow = queryObj.StartRow || 0
      const pageNo = Math.ceil(startRow / 50)
      if (!subcategoryId) {
        return `/categories`
      } else {
        const query = knex
          .select('Category as categoryId')
          .from('Subcategory')
          .where('ID', subcategoryId)
          .first()
        const category = await readDB(query, 'Subcategory')
        if (!category) {
          return `/categories`
        } else {
          const { categoryId } = category
          if (pageNo > 1) {
            return `/search/c/${categoryId}/sc/${subcategoryId}/p/${pageNo}`
          } else {
            return `/search/c/${categoryId}/sc/${subcategoryId}`
          }
        }
      }
    }
  },
  {
    src: /Results\.cfm\?KeyWords=(.+)/,
    dest: (_, searchPhrase) => `/search/?searchPhrase=${searchPhrase}`
  },
  {
    src: /detail.cfm\?ID=(\d+)/,
    dest: (_, productId) => `/product/${productId}`
  },
]

const handler = async (req, res) => await withDB(async () => {
  const requestUrl = req.url
  console.log('redirecting', requestUrl)
  for (const cfg of redirectUrls) {
    const match = cfg.src.exec(requestUrl)
    if (match) {
      const pathname = await Promise.resolve(cfg.dest.apply(null, match))
      const redirectPath = url.resolve(process.env.SITE_URL, pathname)
      res.setHeader('Location', redirectPath)
      res.status(301)
      res.send('Moved to: ' + redirectPath)
      return
    }
  }
  res.status(404)
  res.send('Not found')
})

const app = require('express')()
app.get('*', handler)
const serverless = require('serverless-http')
module.exports = {}
module.exports.lambda = serverless(app)
