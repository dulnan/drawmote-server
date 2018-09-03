var stringHash      = require('string-hash');
var bodyParser      = require('body-parser');
var crypto          = require('crypto');
var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var SocketPeer      = require('socketpeer');
var ExpressBrute    = require('express-brute');

var bruteStore      = new ExpressBrute.MemoryStore();
var bruteforce      = new ExpressBrute(bruteStore);

var app             = express();
var server          = http.createServer(app);

var peer = new SocketPeer({
  httpServer: server,
  pairCodeValidator: function (hash) {
    return peeringHashes.hasOwnProperty(hash)
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var codes = {}
var peeringHashes = {}
var sessions = []


function sha256 (data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function md5 (data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

function buildRandomHex () {
  return crypto.randomBytes(64).toString('hex');
}

function buildPeeringHash () {
  let hash = buildRandomHex()

  do {
    hash = sha256(hash + Date.now() + '/=@2(*£àéZF?=}[½}/%)')
  } while (peeringHashes[hash])

  peeringHashes[hash] = true

  return hash
}

function codeIsValid (code) {
  if (!Number.isInteger(code)) {
    return false
  }

  const codeString = code.toString()

  if (codeString.length !== 6) {
    return false
  }

  if (!codes.hasOwnProperty(codeString)) {
    return false
  }

  return true
}

function hashIsValid (hash, code) {
  const codeString = code.toString()

  if (codeIsValid(code)) {
    if (codes[codeString] === hash) {
      return true
    }
  }

  return false
}

function getPeeringHashByCode (code) {
  return codes[String(code)]
}

function buildPairingCode (id) {
  const timestamp = new Date();
  const hash = stringHash(id);

  let code = '000000'

  do {
    code = String(Math.round(hash * Math.random() * 89999) / Math.random()).substring(0, 6);
  } while (codes[code])

  codes[code] = id

  return code
}

app.get('/', function(req, res) {
  res.redirect('https://drawmote.app')
});

app.get('/code/get', function(req, res) {
  const hash = buildPeeringHash()
  const code = buildPairingCode(hash)

  res.json({
    hash: hash,
    code: code
  });
});


app.post('/code/validate', function(req, res) {
  const code = req.body.code;

  if (codeIsValid(code)) {
    res.json({
      isValid: true,
      hash: getPeeringHashByCode(code),
      code: code
    })
  } else {
    res.json({
      isValid: false
    })
  }
});

app.post('/hash/validate', function(req, res) {
  const code = req.body.pairing.code;
  const hash = req.body.pairing.hash;

  if (hashIsValid(hash, code)) {
    res.json({
      isValid: true
    })
  } else {
    res.json({
      isValid: false
    })
  }
});


peer.on('connect', function (test) {
})

server.listen(process.env.PORT || 3000);
