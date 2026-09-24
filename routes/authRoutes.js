const express = require('express');
const router =  express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const authControllers = require('../controllers/authController');

router.post('/register',authControllers.register);
router.post('/login', authControllers.login);
router.post('/update-password',isLoggedIn,authControllers.updatePassword);
router.post('/reset-password',authControllers.forgotPassword);
router.post('/send-otp',authControllers.sendOtp);
router.post('/refresh-token',authControllers.refreshToken);
router.get('/login-with-google',authControllers.loginWithGoogle);
router.post('/google/callback',authControllers.googleCallback);
router.get('/profile',isLoggedIn,authControllers.getProfile);
router.post('/logout',isLoggedIn,authControllers.logout);


module.exports = router;