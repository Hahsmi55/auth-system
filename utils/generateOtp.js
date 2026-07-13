const crypto = require('crypto')

const generateOtp = (length = 6) => {
    const otp = crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
    return otp;
}   

const hashOtp = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

module.exports = { generateOtp, hashOtp };