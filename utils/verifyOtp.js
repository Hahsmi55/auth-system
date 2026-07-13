const verifyOtp = (otpInput, otpStored) => {
    const hashedInput = crypto.createHash('sha256').update(otpInput).digest('hex');
    return hashedInput === otpStored;
};

module.exports = verifyOtp;