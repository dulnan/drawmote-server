const EXPIRE_CODE = 68
const EXPIRE_PAIRED = 60 * 60 * 24 * 7

const HASH_SALT = process.env.HASH_SALT || '/=@2(*£àéZF?=}[½}/%)'

const { promisify } = require('util')

var stringHash      = require('string-hash')
var crypto          = require('crypto')


function Pairing (code, hash) {
  this.code = code
  this.hash = hash
}

function Validation (isValid) {
  this.isValid = isValid
}

function buildRandomHex () {
  const random = crypto.randomBytes(64).toString('hex') + Date.now() + HASH_SALT
  return crypto.createHash('sha256').update(random).digest('hex')
}

function buildRandomCode (hash) {
  return String(Math.round(hash * Math.random() * 89999) / Math.random()).substring(0, 6)
}

function isString (v) {
  return typeof v === 'string' || v instanceof String
}

function codeIsValid (code) {
  if (!isString(code)) {
    return false
  }

  if (code.length !== 6) {
    return false
  }

  if (/^\d+$/.test(code) === false) {
    return false
  }

  return true
}

function hashIsValid (hash) {
  return true
}

function pairingIsValid (pairing) {
  return codeIsValid(pairing.code) && hashIsValid(pairing.hash)
}

class Store {
  constructor(redisClient) {
    this.redisGet = promisify(redisClient.get).bind(redisClient)
    this.redisSet = promisify(redisClient.set).bind(redisClient)
    this.redisExists = promisify(redisClient.exists).bind(redisClient)
    this.redisDel = promisify(redisClient.del).bind(redisClient)
    this.redisExpire = promisify(redisClient.expire).bind(redisClient)
  }

  async keyExists(hash) {
    const res = await this.redisExists(hash);
    return res === 1;
  }

  async generateHash() {
    let alreadyUsed = false;
    let hash = '';

    do {
      hash = buildRandomHex();
      alreadyUsed = await this.keyExists(hash);
    } while (alreadyUsed);

    return hash;
  }

  async generateCode(hash) {
    const numericHash = stringHash(hash);
    let alreadyUsed = false;
    let code = '000000';

    do {
      code = buildRandomCode(numericHash)
      alreadyUsed = await this.keyExists(code);
    } while (alreadyUsed);

    return code;
  }

   generatePairing () {
    return new Promise(async (resolve, reject) => {
      const hash = await this.generateHash();
      const code = await this.generateCode(hash);

      const hashIsSet = await this.redisSet(hash, code, 'EX', EXPIRE_CODE) === 'OK';
      const codeIsSet = await this.redisSet(code, hash, 'EX', EXPIRE_CODE) === 'OK';

      if (hashIsSet && codeIsSet) {
        resolve(new Pairing(code, hash));
      } else {
        reject(new Error('GeneratingPairFailed'));
      }
    })
  }

  getPairingFromCode (code) {
    return new Promise(async (resolve, reject) => {
      if (codeIsValid(code)) {
        const exists = await this.keyExists(code)

        if (exists) {
          const hash = await this.redisGet(code)
          await this.redisDel(code)
          await this.redisExpire(hash, EXPIRE_PAIRED)

          resolve(new Pairing(code, hash))
        } 
      }

      resolve({})
    })
  }

  validatePairing (pairing) {
    return new Promise(async (resolve, reject) => {
      let isValid = false

      if (pairingIsValid(pairing)) {
        const hashExists = await this.keyExists(pairing.hash)

        if (hashExists) {
          const code = await this.redisGet(pairing.hash)

          if (pairing.code === code) {
            isValid = true
          }
        }
      }

      resolve(new Validation(isValid))
    })
  }
}

module.exports = Store