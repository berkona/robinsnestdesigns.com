const { processAllProducts } = require('../handlers/search-engine-import')
processAllProducts().catch(err => console.error(err)).finally(() => process.exit())
