/**
 * drawmote server
 * 
 * The server manages the generation and validation of pairing codes and hashes.
 * They are stored in redis, for local development redis-mock is used.
 * 
 * Generated Pairings are only valid for a short amount of time. If they are not
 * validated in that time slot, they are deleted. If they are validated, the code
 * is removed from redis, while the hash's expire time is increased.
 */
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


/**
 * Main server function.
 */
async function main () {
  // Create http server.
  var app = express()
  var server = http.createServer(app)

  // Create SocketPeer instance for WebRTC and WebSockets handling.
  var peer = new SocketPeer({
    httpServer: server,
    pairCodeValidator: async function (hash) {
      const exists = await state.validateHash(hash)
      return exists
    }
  })

  // Create redis client and pass it to our Store class.
  const redisClient = await getRedisClient()
  const state = new Store(redisClient)

  // Setup express-brute
  // This prevents requesting too many codes in a short amount of time.
  var bruteStore = new BruteRedis({
    client: redisClient
  })

  var bruteforce = new ExpressBrute(bruteStore, {
    freeRetries: isProduction ? 12 : 100
  })
  
  // Add express plugins.
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json());
  app.use(cors());

  // Redirect to frontend app when accessing root.
  app.get('/', function(req, res) {
    res.redirect('https://drawmote.app')
  })

  // Return a pairing code.
  app.get('/code/get', bruteforce.prevent, async function(req, res) {
    const pairing = await state.generatePairing()
    res.json(pairing)
  })

  // Return a pairing or an empty object if the given code is valid.
  app.post('/code/validate', bruteforce.prevent, async function(req, res) {
    const pairing = await state.getPairingFromCode(req.body.code)
    res.json(pairing)
  })

  // Return a Validation if the given pairing is valid.
  app.post('/pairing/validate', bruteforce.prevent, async function(req, res) {
    const validation = await state.validatePairing(req.body)
    res.json(validation)
  })

  // Start server.
  server.listen(process.env.PORT || 3000)
}

main()
