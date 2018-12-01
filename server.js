// Connect and use a redis server for storage and provide an express
// middleware that prevents brute force attacks on the server.

const PeerSoxServer = require('peersox').default
const ExpressBrute = require('express-brute')
const express = require('express')
const redis = require('redis')
const BruteRedis = require('express-brute-redis')

// Create a new redis client.
const url = process.env.REDIS_URL
const port = process.env.PORT || 3000

if (url) {
  const redisClient = redis.createClient(url)
  const app = express()

  // Init the PeerSox server when the redis client is ready.
  redisClient.on('ready', function () {
    console.log('Connected to Redis at ' + port)

    // Use the redis client as the store for express-brute.
    const bruteStore = new BruteRedis({
      client: redisClient
    })

    // Instantiate the express-brute middleware.
    const bruteforce = new ExpressBrute(bruteStore, {
      freeRetries: 20
    })

    // Instantiate the PeerSox server.
    new PeerSoxServer({
      storage: redisClient,
      app: app,
      port: port,
      middleware: [
        bruteforce.prevent
      ]
    })
  })
} else {
  new PeerSoxServer()
}
