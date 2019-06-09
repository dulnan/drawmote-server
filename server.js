// Connect and use a redis server for storage and provide an express
// middleware that prevents brute force attacks on the server.

const PeerSoxServer = require('peersox').default
const ExpressBrute = require('express-brute')
const express = require('express')
const helmet = require('helmet')
const http = require('http')
const cors = require('cors')
const redis = require('redis')

let corsOptions = {}

const IS_DEV = process.env.NODE_ENV !== 'production'

if (IS_DEV) {
  const ip = require('ip')
  require('dotenv').config()

  corsOptions = {
    origin: [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://192.168.80.43:8080',
      `http://${ip.address()}:8080`,
      `http://${ip.address()}:8081`,
    ],
    optionsSuccessStatus: 200
  }
} else {
  corsOptions = {
    origin: [
      'https://drawmote.app',
      'https://develop.drawmote.app'
    ],
    optionsSuccessStatus: 200
  }
}

const SID = process.env.TWILIO_ACCOUNT_SID
const TOKEN = process.env.TWILIO_AUTH_TOKEN

if (!SID || !TOKEN) {
  console.log('Missing credentials for Twilio.')
  process.exit()
}

const twilio = require('twilio')(SID, TOKEN)

const url = process.env.REDIS_URL || 'redis://localhost:6379'
const port = process.env.PORT || 3000

let app = express()
let server = http.createServer(app)

app.use(helmet())
app.use(cors(corsOptions))

app.use(express.json({ limit: '20kb' }))

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

let peersoxServer

if (url) {
  const redisClient = redis.createClient(url)

  // Init the PeerSox server when the redis client is ready.
  redisClient.on('error', (error) => {
    console.log(error)
  })

  console.log('Connected to Redis at ' + port)

  app.enable('trust proxy')
  app.set('trust proxy', true)

  // Instantiate the PeerSox server.
  peersoxServer = new PeerSoxServer(redisClient, {
    app: app,
    server: server,
    port: port,
    config: getConfig,
    allowOrigins: corsOptions.origin
  })
}

server.listen(port)