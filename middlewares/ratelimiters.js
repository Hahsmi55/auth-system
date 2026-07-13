const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');


const loginLimiter = rateLimit({
  store: new RedisStore({
  sendCommand: (...args) => redisClient.sendCommand(args)
}),

  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});


const otpLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }),
  windowMs: 10 * 60 * 1000, // 10 min
  max: 3, // 3 OTP requests
  message: {
    success: false,
    message: "Too many OTP requests. Try again later.",
  },
});

const registerLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args) 
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many accounts created from this IP. Try later.",
  },
});

const PasswordLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  }),
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset attempts. Try later.",
  },
});

module.exports = {  
    loginLimiter,
    otpLimiter,
    registerLimiter,
    PasswordLimiter
}  