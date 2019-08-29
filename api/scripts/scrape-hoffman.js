const { main } = require('../handlers/scrape-hoffman')
if (require.main === module) {
    main().then(() => {
      console.log('scrape hoffman finished')
      setTimeout(() => process.exit(), 250)
    })
    .catch((err) => console.error('uncaught error', err))
}
