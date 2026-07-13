const crypto = require('crypto');

function generateState(size) {
    return crypto.randomBytes(size).toString('hex');
}

module.exports = generateState;