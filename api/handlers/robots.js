if (!process.env.SITE_URL)
  throw new Error("Requires SITE_URL to be an environment variable")

const CACHE_TIME = 60 * 60 * 24

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${process.env.SITE_URL}sitemap.xml
`

const app = require('express')()
app.get('*', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain;charset=UTF-8')
  res.setHeader('Cache-Control', 'public,max-age=' + CACHE_TIME)
  res.send(ROBOTS_TXT)
})

const serverless = require('serverless-http')

module.exports = {}
module.exports.lambda = serverless(app)
