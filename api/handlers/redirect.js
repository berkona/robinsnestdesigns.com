const url = require('url')
const knex = require('../knex')

const redirectUrls = [
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
    src: /results\.cfm/,
    dest: async (url) => {
      url = new URL(url)
      const subcategoryId = url.searchParams.get('SubCategory')
      const startRow = url.searchParams.get('StartRow')
      const pageNo = Math.ceil(startRow / 50)
      const category = await knex
        .select('Category as categoryId')
        .from('Subcategory')
        .where('ID', subcategoryId)
        .first()
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

const handler = async (req, res) => {
  const requestUrl = req.url
  console.log('redirecting', requestUrl)
  for (const cfg of redirectUrls) {
    const match = cfg.src.exec(requestUrl)
    if (match) {
      const redirectPath = url.resolve(process.env.SITE_URL, await Promise.resolve(cfg.dest.apply(null, match)))
      res.setHeader('Location', redirectPath)
      res.status(301)
      res.send('Moved to: ' + redirectPath)
      return
    }
  }
  res.status(404)
  res.send('Not found')
}

const app = require('express')()
app.get('*', handler)
const serverless = require('serverless-http')
module.exports = {}
module.exports.lambda = serverless(app)
