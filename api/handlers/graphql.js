const { ApolloServer } = require('../apollo-server')
const {
  typeDefs,
  resolvers,
} = require('../schema')
const { withDB } = require('../db')
const responseCachePlugin = require('apollo-server-plugin-response-cache')

// TODO: better detection here
const isDev = process.env.NODE_ENV != "production"

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDev,
  playground: isDev,
  tracing: isDev,
  plugins: [responseCachePlugin()],
})

const graphqlHandler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Apollo-Tracing'
  },
})

const runHandler = (evt, ctx, handler) => new Promise((resolve, reject) => {
  handler(evt, ctx, (err, body) => err ? reject(err) : resolve(body))
})

const LOG_THRESHOLD = 2000

module.exports.lambda = async (evt, ctx) => withDB(() => runHandler(evt, ctx, graphqlHandler))
