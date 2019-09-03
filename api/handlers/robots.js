if (!process.env.SITE_URL)
  throw new Error("Requires SITE_URL to be an environment variable")

const SITE_URL = process.env.SITE_URL.endsWith('/') ? process.env.SITE_URL : (process.env.SITE_URL + '/')
const CACHE_TIME = 60 * 60 * 24 * 14

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`

module.exports = {
  handler: async (req, res) => {
    res.setHeader('Content-Type', 'text/plain;charset=UTF-8')
    res.setHeader('Cache-Control', 'public,max-age=' + CACHE_TIME)
    res.send(ROBOTS_TXT)
  },
}
