const isProduction  = process.env.NODE_ENV === 'production'

var bodyParser      = require('body-parser')
var express         = require('express')
var http            = require('http')
var cors            = require('cors')
var SocketPeer      = require('socketpeer/server')
var ExpressBrute    = require('express-brute')
var BruteRedis      = require('express-brute-redis')

var Store           = require('./classes/store')
var getRedisClient  = require('./classes/storage')


async function main () {
  const redisClient = await getRedisClient()
  const state = new Store(redisClient)

  // Setup express-brute
  var bruteStore = new BruteRedis({
    client: redisClient
  })

  var bruteforce = new ExpressBrute(bruteStore, {
    freeRetries: isProduction ? 5 : 500
  })

  var app = express()
  var server = http.createServer(app)

  var peer = new SocketPeer({
    httpServer: server,
    pairCodeValidator: async function (hash) {
      const exists = await state.validateHash(hash)
      return exists
    }
  })

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json());
  app.use(cors());

  app.get('/', function(req, res) {
    res.redirect('https://drawmote.app')
  })

  app.get('/code/get', bruteforce.prevent, async function(req, res) {
    const pairing = await state.generatePairing()
    res.json(pairing)
  })

  app.post('/code/validate', bruteforce.prevent, async function(req, res) {
    const pairing = await state.getPairingFromCode(req.body.code)
    res.json(pairing)
  })

  app.post('/pairing/validate', bruteforce.prevent, async function(req, res) {
    const validation = await state.validatePairing(req.body)
    res.json(validation)
  })

  server.listen(process.env.PORT || 3000)
}

main()
