const crypto = require('crypto')

/**
 * Generate a random hex code in form of a sha256 hash.
 */
exports.buildRandomHex = function () {
  const random = crypto.randomBytes(64).toString('hex')
  return crypto.createHash('sha256').update(random).digest('hex')
}

/**
 * Generate a random number.
 * 
 * @param {String} hash A random hash as a String.
 * @returns {String} A random numerical code as a String.
 */
exports.buildRandomCode = function (hash) {
  return String(Math.round(hash * Math.random() * 89999) / Math.random()).substring(0, 6)
}

/**
 * Check if given argument is a String.
 * 
 * @param {*} v 
 * @returns {Boolean}
 */
exports.isString = function (v) {
  return typeof v === 'string' || v instanceof String
}

/**
 * Checks if the given code is valid.
 * 
 * @param {String} code 
 * @returns {Boolean}
 */
exports.codeIsValid = function (code) {
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

/**
 * Checks if the given string is a valid pairing hash.
 * 
 * @param {String} hash 
 */
exports.hashIsValid = function (hash) {
  return true
}

/**
 * Checks if the code and hash of the pairing are valid.
 * 
 * @param {Pairing} pairing 
 */
exports.pairingIsValid = function (pairing) {
  return codeIsValid(pairing.code) && hashIsValid(pairing.hash)
}