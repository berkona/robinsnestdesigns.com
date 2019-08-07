const retry = require('async-retry')
const NamespacedCache = require('./cache')
const migrate = require('./migrate')
const knex = require('../knex')

// TODO: tune these params
const CACHE_MAX_SIZE = 2 << 15
const CACHE_MAX_AGE = 30 * 60 * 1000

const QUERY_RETRIES = 10
const QUERY_DELAY_MIN = 100
const QUERY_DELAY_FACTOR = 1.55909

const ETIMEOUT = 'ETIMEOUT'
const EREQUEST = 'EREQUEST'
const ER_NOT_SUPPORTED_YET = 'ER_NOT_SUPPORTED_YET'

const cache = new NamespacedCache({
  max: CACHE_MAX_SIZE,
  maxAge: CACHE_MAX_AGE,
})

let knexNeedsInitialize = false

const withDB = async (asyncFn) => {
  try {
    return await asyncFn()
  } finally {
    await finalize()
  }
}

const finalize = async () => {
  knexNeedsInitialize = true
  // TODO: sweep for zombies
  await knex.destroy()
}

const runQueryWithRetry = async (query) => {
  return await retry(async bail => {
    // TODO: bail logic
    // TODO: attempt to free connections if we hit a Too Many Connections issues
    try {
      return await runQuery(query)
    } catch (err) {
      console.error('runQueryWithRetry', 'error', err)
      const retryRequest = err.code != EREQUEST
                        && err.code != ER_NOT_SUPPORTED_YET
      if (!retryRequest) bail(err)
      else throw err
    }
  }, {
    retries: QUERY_RETRIES,
    factor: QUERY_DELAY_FACTOR,
    minTimeout: QUERY_DELAY_MIN,
    randomize: true,
  })
}

const runQuery = async (query) => {
  if (knexNeedsInitialize) {
    knexNeedsInitialize = false
    await knex.initialize()
  }
  return await query
}

let nTotal = 0
let nMisses = 0

const readDB = async (query, namespace) => {
  // await migrate()
  const key = query.toString()
  let queryPromise = cache.get(key)
  nTotal++
  if (!queryPromise) {
    nMisses++
    console.log('query cache miss', {
      namespace,
      key,
      nTotal,
      nMisses,
      missRate: (nMisses / nTotal) * 100,
    })
    queryPromise = runQueryWithRetry(query)
    cache.set(key, queryPromise, namespace)
  }
  return await Promise.resolve(queryPromise)
}

const writeDB = async (query, namespace) => {
  // await migrate()
  cache.invalidate(namespace)
  // TODO: the current awaiters of promises in namespaces will prolly still see old data
  // TODO retry updates/inserts?
  return await runQuery(query)
}

module.exports = {
  knex,
  readDB,
  writeDB,
  withDB,
  finalize,
  runQuery,
}
