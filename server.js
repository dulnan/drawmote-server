// Connect and use a redis server for storage and provide an express
// middleware that prevents brute force attacks on the server.

const PeerSoxServer = require('peersox').default
const ExpressBrute = require('express-brute')
const express = require('express')
const redis = require('redis')
const http = require('http')
const BruteRedis = require('express-brute-redis')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const SID = process.env.TWILIO_ACCOUNT_SID
const TOKEN = process.env.TWILIO_AUTH_TOKEN

if (!SID || !TOKEN) {
  console.log('Missing credentials for Twilio.')
  process.exit()
}

const twilio = require('twilio')(SID, TOKEN)

const url = process.env.REDIS_URL

let app = express()
let server = http.createServer(app)
let port = process.env.PORT || 3000

let cachedToken = null

// 60 Minutes.
const TOKEN_TTL = 60 * 60

function getNewToken () {
  twilio.tokens.create({
    ttl: TOKEN_TTL
  }, function(err, token) {
    if (!err && token) {
      cachedToken = token;
    }
  })
}

// fetch token initially
getNewToken()
// refetch new token every 15 mins and save to cache
setInterval(getNewToken, (TOKEN_TTL - 10) * 1000)

const getConfig = () => {
  return {
    iceServers: cachedToken.iceServers.map(item => {
      let newItem = {
        urls: item.url
      }

      if (item.username) {
        newItem.username = item.username
      }

      if (item.credential) {
        newItem.credential = item.credential
      }

      return newItem
    })
  }
}

if (url) {
  const redisClient = redis.createClient(url)

  // Init the PeerSox server when the redis client is ready.
  redisClient.on('error', (error) => {
    console.log(error)
  })
  redisClient.on('ready', () => {
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
      server: server,
      port: port,
      config: getConfig,
      middleware: [
        bruteforce.prevent
      ]
    })
  })
} else {
  new PeerSoxServer({
    app,
    server,
    port,
    config: getConfig
  })
}

server.listen(port)