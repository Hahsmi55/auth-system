const express = require('express');
const router =  express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const authControllers = require('../controllers/authController');
const rateLimiter = require('../middlewares/ratelimiters');

router.post('/register',rateLimiter.registerLimiter,authControllers.register);
router.post('/login',rateLimiter.loginLimiter   ,authControllers.login);
router.post('/update-password',isLoggedIn,rateLimiter.PasswordLimiter,authControllers.updatePassword);
router.post('/reset-password',rateLimiter.PasswordLimiter  ,authControllers.forgotPassword);
router.post('/send-otp',rateLimiter.otpLimiter,authControllers.sendOtp);
router.post('/refresh-token',authControllers.refreshToken);
router.post('/login-with-google',authControllers.loginWithGoogle);
router.post('/auth/google/callback',authControllers.googleCallback);
router.get('/profile',isLoggedIn,authControllers.getProfile);
router.post('/logout',isLoggedIn,authControllers.logout);


module.exports = router;