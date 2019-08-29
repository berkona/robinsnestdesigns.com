const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const urlLib = require('url')

const { withDB, knex, readDB } = require('../db')
const signS3Url = require('../signS3Url')
const { longestCommonPrefix, uploadFromURL } = require('../utils')
const insertProduct = require('../db/Product/insertProduct')

const baseUrl = 'https://hoffmandis.com'
const loginUrl = 'https://hoffmandis.com/Account/Login'
const dataUrl = 'https://hoffmandis.com/FridayUpdate'

if (!process.env.HOFFMAN_EMAIL || !process.env.HOFFMAN_PASSWORD)
  throw new Error('HOFFMAN_EMAIL and HOFFMAN_PASSWORD must be set in the environment')

const HOFFMAN_EMAIL = process.env.HOFFMAN_EMAIL
const HOFFMAN_PASSWORD = process.env.HOFFMAN_PASSWORD
const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

// login to hoffmandis website
const login = async (browser) => {
  const page = await browser.newPage()
  try {
    console.log('Logging into website')
    await page.goto(loginUrl)
    page.$('#loginForm form')
    await page.type('#Email', HOFFMAN_EMAIL)
    await page.type('#Password', HOFFMAN_PASSWORD)
    console.log('Submitting credentials')
    await page.$eval('#loginForm form', form => form.submit());
    //await page.screenshot({path: 'login.png'});
    console.log('Login succeeded')
  } finally {
    await page.close()
  }
}

const scrapeDetailUrl = async (detailUrl, browser) => {
  const page = await browser.newPage()
  try {
    console.log('Processing detail url', detailUrl)
    await page.goto(detailUrl)
    const detailHtml = await page.content()
    const detailJQuery = cheerio.load(detailHtml)
    const productImgUrl = detailJQuery('.panel-body .col-md-5 img').attr('src')
    // todo upload productImgUrl to S3
    const hyperlinkedImage = productImgUrl

    const hoffmanFields = detailJQuery('.panel-body .col-md-7 dl dd').toArray()
      .map((obj) => detailJQuery(obj).text().trim().split(':'))
      .filter(x => x.length == 2)
      .reduce((obj, curr) => {
        let [ key, value ] = curr
        key = key.trim()
        value = value.trim()
        obj[key] = value
        return obj
      }, {})

    console.log('Got hoffmanFields', hoffmanFields)

    const designerName = hoffmanFields['Designer']

    const sku = hoffmanFields['Item#']
    // check if already added to DB
    const exists = await knex.select('ID').from('Products').where('ItemID', sku)
    if (exists) {
      console.log('sku', sku, 'already exists in Products DB, skipping')
      return null
    }

    const name = hoffmanFields['Title']
    const price = (Number.parseFloat(hoffmanFields['Retail'].replace('$', '')) + 0.99).toFixed(2)
    const salePrice = (Number.parseFloat(price) * 0.9).toFixed(2)
    const saleStart = Date.now()
    const saleEnd = Date.now() + ONE_MONTH
    const sizeStr = hoffmanFields['Size'] ? '  Size: ' + hoffmanFields['Size'] + '.' : ''
    const description = `Cross stitch chart by ${designerName}.${sizeStr}`
    const qtyInStock = 0

    // find the designer based hoffmanFields['Designer']
    const categoryId = 12
    let [ subcategoryId ] = await knex.pluck('ID')
        .from('Subcategory')
        .where('Subcategory.Subcategory', designerName)

    if (!subcategoryId) {
      console.log('Could not find designer in Charts by Designer', designerName)

      const allDesigners = await knex.select('Subcategory as subcategory', 'ID as id').from('Subcategory').where('Category', 12)

      const [ bestDesigner ] = allDesigners.map(({ subcategory, id }) => {
        const lcp = longestCommonPrefix([ designerName, subcategory ])
        return {
          id: id,
          subcategory: subcategory,
          distance: -lcp.length,
        }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 1)

      // ensure at least half of the name matched the target
      if (bestDesigner && bestDesigner.distance < -designerName.length * 0.5) {
        console.log('best designer match', bestDesigner)
        subcategoryId = bestDesigner.id
      } else {
        throw new Error('designer not found', designerName)
      }
    }

    const productFields = {
      sku,
      name,
      price,
      qtyInStock,
      categoryId,
      subcategoryId,
      description,
      hyperlinkedImage,
      salePrice,
      saleStart,
      saleEnd,
    }

    return productFields
  } finally {
    await page.close()
  }
}

const processUrl = async(url, browser) => {
  const product = await scrapeDetailUrl(url, browser)
  if (product) {
    product.hyperlinkedImage = await uploadFromURL(product.hyperlinkedImage)
    await insertProduct(product)
  }
}

// scrape FridayUpdate url and return products as JSON objects ready to insert into DB
const scrape = async (url, browser) => {
  console.log('Scraping page', url)
  const page = await browser.newPage()
  try {
    await page.goto(url)
    //await page.screenshot({ path: 'FridayUpdate.png' })
    const html = await page.content()
    const jQuery = cheerio.load(html)
    const detailUrls = jQuery('.panel-body form .row .img-responsive a')
      .toArray()
      .map(obj => urlLib.resolve(baseUrl, jQuery(obj).attr('href')))

    console.log('Found detail urls', detailUrls)

    detailUrls.forEach(u => enqueue(() => processUrl(u, browser)))

    const nextPageUrl = jQuery('.pagination li.PagedList-skipToNext a').attr('href')
    if (nextPageUrl) {
      enqueue(() => scrape(urlLib.resolve(baseUrl, nextPageUrl), browser))
    }
  } finally {
    await page.close()
  }
}

const maxRunningJobs = 10

const runningJobs = []
const jobQueue = []

const enqueue = (job) => {
  jobQueue.push(job)
}

const startJobs = async (startTime, maxRunTime) => {
  const dT = Date.now() - startTime
  if (dT > maxRunTime) {
    throw new Error('timeout')
  }

  while (jobQueue.length > 0 && runningJobs.length < maxRunningJobs) {
    console.log('startJobs', 'jobQueue', jobQueue.length, 'runningJobs', runningJobs.length)
    const nextJob = jobQueue.shift()
    runningJobs.push(nextJob())
  }

  if (runningJobs.length > 0) {
    await runningJobs[0]
    console.log('runningJobs[0] done', 'jobQueue', jobQueue.length, 'runningJobs', runningJobs.length)
    runningJobs.shift()
    await startJobs()
  }
}

const main = withDB(async () => {
  const startTime = Date.now()
  const maxRunTime = 25000
  const browser = await puppeteer.launch({
      args : [
          '--window-size=1920,1080'
      ]
  })
  try {
    enqueue(async () => {
      await login(browser)
      enqueue(() => scrape(dataUrl, browser))
    })
    await startJobs(startTime, maxRunTime)
  } finally {
    await browser.close()
    console.log('browser closed')
  }
})

module.exports = { main, }
