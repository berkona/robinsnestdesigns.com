const retry = require('async-retry')
const NamespacedCache = require('./cache')
const migrate = require('./migrate')
const knex = require('../knex')

// TODO: tune these params
const CACHE_MAX_SIZE = Infinity
const CACHE_MAX_AGE = 30 * 60 * 1000

const QUERY_RETRIES = 10
const QUERY_DELAY_MIN = 100
const QUERY_DELAY_FACTOR = 1.55909

// Common Too Many Connections Errors
const TOO_MANY_CONN_ERRORS = [
	'ER_TOO_MANY_USER_CONNECTIONS',
	'ER_CON_COUNT_ERROR',
	'ER_USER_LIMIT_REACHED',
	'ER_OUT_OF_RESOURCES',
	'ER_CON_COUNT_ERROR',
	'PROTOCOL_CONNECTION_LOST', // if the connection is lost
	'ETIMEDOUT' // if the connection times out
]

const ZOMBIE_TIMEOUT_MIN = 3
const ZOMBIE_TIMEOUT_MAX = 60 * 15

const CONNS_UTIL_MAX = 0.8
const CONNS_FREQ_MAX = 15 * 1000
const CONNS_FREQ_USED = 0

const DB_USER = process.env.SQL_USER

const cache = new NamespacedCache({
	max: CACHE_MAX_SIZE,
	maxAge: CACHE_MAX_AGE,
})

let knexNeedsInitialize = false
let _maxConns = {
	updated: 0
}
let _usedConns = {
	updated: 0
}

const withDB = async (asyncFn) => {
	try {
		return await asyncFn()
	} finally {
		await finalize()
	}
}

// Get the max connections (either for this user or total)
const getMaxConnections = async () => {

	// If cache is expired
	if (Date.now() - _maxConns.updated > CONNS_FREQ_MAX) {

		let results = await runQueryWithRetry(knex.raw(
			`SELECT IF(@@max_user_connections > 0,
      LEAST(@@max_user_connections,@@max_connections),
      @@max_connections) AS total,
      IF(@@max_user_connections > 0,true,false) AS userLimit`
		))

		// Update _maxConns
		_maxConns = {
			total: results[0].total || 0,
			userLimit: results[0].userLimit === 1 ? true : false,
			updated: Date.now()
		}

	} // end if renewing cache

	return _maxConns

} // end getMaxConnections

// Get the total connections being used and the longest sleep time
const getTotalConnections = async () => {

	// If cache is expired
	if (Date.now() - _usedConns.updated > CONNS_FREQ_USED) {

		let results = await runQueryWithRetry(knex.raw(
			`SELECT COUNT(ID) as total, MAX(time) as max_age
      FROM information_schema.processlist
      WHERE (user = ? AND @@max_user_connections > 0) OR true`, [DB_USER]))

		_usedConns = {
			total: results[0].total || 0,
			maxAge: results[0].max_age || 0,
			updated: Date.now()
		}

	} // end if refreshing cache

	return _usedConns

} // end getTotalConnections


// Kill all zombie connections that are older than the threshold
const killZombieConnections = async (timeout) => {
	let killedZombies = 0

	// Hunt for zombies (just the sleeping ones that this user owns)
	let zombies = await runQueryWithRetry(knex.raw(
		`SELECT ID,time FROM information_schema.processlist
      WHERE command = "Sleep" AND time >= ? AND user = ?
      ORDER BY time DESC`,
		[!isNaN(timeout) ? timeout : 60 * 15, DB_USER]))

	// Kill zombies
	for (let i = 0; i < zombies.length; i++) {
		try {
			await knex.raw('KILL ?', zombies[i].ID)
			killedZombies++
		} catch (e) {
			console.error('db.killZombieConnections', 'unexpected error', e)
		}
	} // end for

	return killedZombies

} // end killZombieConnections

const quit = async () => {
	knexNeedsInitialize = true
	await knex.destroy()
}

const finalize = async () => {
	// sweep for zombies
	// Check the number of max connections
	let maxConns = await getMaxConnections()
	// Check the number of used connections
	let usedConns = await getTotalConnections()
	// If over utilization threshold, try and clean up zombies
	if (usedConns.total / maxConns.total > CONNS_UTIL_MAX) {
		// Calculate the zombie timeout
		let timeout = Math.min(Math.max(usedConns.maxAge, ZOMBIE_TIMEOUT_MIN), ZOMBIE_TIMEOUT_MAX)
		// Kill zombies if they are within the timeout
		let killedZombies = timeout <= usedConns.maxAge ? await killZombieConnections(timeout) : 0
		// If no zombies were cleaned up, close this connection
		if (killedZombies === 0) {
			await quit()
		}
		// If zombies exist that are more than the max timeout, kill them
	} else if (usedConns.maxAge > ZOMBIE_TIMEOUT_MAX) {
		await killZombieConnections(ZOMBIE_TIMEOUT_MAX)
	}
}

const runQueryWithRetry = async (query) => {
	return await retry(async bail => {
		try {
			return await runQuery(query)
		} catch (err) {
			console.error('db.runQueryWithRetry', 'error', err)
			if (!TOO_MANY_CONN_ERRORS.includes(err.code)) {
				bail()
			}
			throw err
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
		await knex.initialize()
		knexNeedsInitialize = false
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
		console.log('db.readDB', 'query cache miss', {
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
