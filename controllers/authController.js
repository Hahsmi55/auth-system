const User = require('../models/userModel'); 
const sendEmail = require('../utils/sendEmail')
const {generateOtp, hashOtp} = require('../utils/generateOtp') 
const verifyOtp = require('../utils/verifyOtp')
const { randomState, randomNonce, randomPKCECodeVerifier, calculatePKCECodeChallenge, buildAuthorizationUrl, authorizationCodeGrant } = require("openid-client")
const initOpenId = require('../config/open_id_client');
const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');

const register = async (req,res) => {
    try {
        const {username, email, password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json('User already registered')
        }
        const hashedPassword = await User.prototype.hashPassword(password);   
        const createdUser = new User({username, email, password: hashedPassword});
        await createdUser.save();
        return res.json(createdUser);
    } catch (error) {
        return res.status(500).json(`Server internal error : ${error}`)
    }
}

const login = async (req,res) => {
    try {
        const {email, password } = req.body;
        const user = await User.findOne({email});
    if(!user){
        return res.status(401).json('Invalid credentials')
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return res.status(401).json('Invalid credentials')
    }
    const accessToken = user.generateAuthToken();   
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    req.headers['authorization'] = `Bearer ${accessToken}`;
    res.cookie('refresh-token', refreshToken, {httpOnly: true, secure: true , sameSite: 'Strict'});
    
    return res.status(200).json({accessToken, refreshToken})
    } catch (error) {
        return res.status(500).json('Server Intenal error')
    }
}

const refreshToken = async (req,res) => {
    try {
        const refreshToken = req.cookies['refresh-token'];
        if(!refreshToken){
           return res.status(404).json('Unauthorized Request')
        }
        
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({_id: decoded.id})
        if(!user){
            return res.status(404).json('Unauthorized Request')
        }

        const accessToken = user.generateAuthToken();
        const newRefreshToken = user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save();
        req.headers['authorization'] = `Bearer ${accessToken}`;     
        res.cookie('refresh-token', newRefreshToken, {httpOnly:true, secure: true, sameSite: 'Strict'});
        return res.status(200).json({accessToken})
    } catch (error) {
        return res.status(500).json('Server Internal error')
    }
}

const sendOtp = async (req,res) => {   
    try{
        const {email} = req.body;
        const user = await User.findOne({email}); 
        if(!user){
            return res.status(404).json('Entered email is not registered')
        }   
        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);
        const subject = 'Your OTP Code';
        const text = `Your OTP code is ${otp}. It is valid for 1 minute.`;
        user.otp = hashedOtp;
        user.otpExpiry = Date.now() + 1 * 60 * 1000; 
        await user.save();
        const emailSent = await sendEmail(email, subject, text);
        if(!emailSent){
            return res.status(500).json('Error in sending OTP email. Please enteer email again')
        }
        return res.status(200).json('OTP sent successfully')
    } catch (error){
        return res.status(500).json('Server Internal error')
    } 
}

const forgotPassword = async (req,res) => {
    try{
        const {otp, newPassword} = req.body;
        const user = await User.findOne({otpExpiry: {$gt: Date.now()}});
        if(!user){
            return res.status(400).json('OTP expired or invalid')
        }
        const isValidOtp = await verifyOtp(otp, user.otp);
        if(!isValidOtp){
            return res.status(400).json('OTP expired or invalid')
        }
        user.password = await User.prototype.hashPassword(newPassword);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        return res.status(200).json('Password reset successfully')
    } catch( error){
        return res.status(500).json('Server Internal error')
    }   
}


const updatePassword = async (req,res) => {
    try{
        const {oldPass, newPass} = req.body;
        const user = await User.findOne({_id:req.user.id})
        if(!user){
            return res.status(404).json('User not existed')
        }
        const isMatch = await user.comparePassword(oldPass);
        if(!isMatch){
            return res.status(401).json('Invalid old password')
        }
        user.password = await User.prototype.hashPassword(newPass);
        await user.save();
        return res.status(200).json('Password updated successfully')
    } catch( error){
       return res.status(500).json('Server Internal error')
    }
}

const getProfile = async (req,res) => {
    try{
        const user = await User.findOne({_id: req.user.id}).select('-password -refreshToken -otp -otpExpiry');
        if(!user){
            return res.status(404).json('User not found')
        }
        return res.json({user})
    } catch( error){
        return res.status(500).json('Server Internal error')
    }
}

const loginWithGoogle = async (req, res) => {
    try{

        const config = await initOpenId();
        const state = randomState();
        const nonce = randomNonce();
        const codeVerifier = randomPKCECodeVerifier();
        const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
        await redisClient.set(`google:${state}`,JSON.stringify({codeVerifier, nonce}), {EX: 300});

        const url = buildAuthorizationUrl( config, {
            redirect_uri: process.env.REDIRECT_URI,
            response_type: 'code',
            scope: 'openid email profile',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            state: state,
            nonce : nonce
        });

        return res.redirect(url).json('redirecting to google');

    } catch (error) {
        return res.json({
            error : error.message,
            stack : error.stack
        })
    }
};

try {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(400).json("Invalid request");
    }

    const config = await initOpenId();

    const stateData = await redisClient.get(`google:${state}`);

    if (!stateData) {
        return res.status(400).json("Invalid request");
    }

    const { codeVerifier, nonce } = JSON.parse(stateData);

    const tokenSet = await authorizationCodeGrant(
        config,
        new URL(
            `${process.env.REDIRECT_URI}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        ),
        {
            expectedState: state,
            expectedNonce: nonce,
            pkceCodeVerifier: codeVerifier,
            idTokenExpected: true
        }
    );

    // Get Google identity
    const claims = tokenSet.claims();

    const {
        sub: googleId,
        email,
        name,
        picture,
        email_verified
    } = claims;

    // State should only be usable once
    await redisClient.del(`google:${state}`);

    if (!email || !email_verified) {
        return res.status(400).json("Google email is not verified");
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            email,
            username : name,
            password : null,
        });
        await user.save();
    }

    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    req.headers['authorization'] = `Bearer ${accessToken}`;

    res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return res.json({
        message: "Google login successful"
    });

} catch (error) {
    console.error(error);

    return res.status(500).json({
        message: "Google authentication failed"
    });
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies['refresh-token'];
        if(refreshToken){
            const user = await User.findOne({refreshToken});
            if(user){
                user.refreshToken = null;
                await user.save();
            }
        }
        req.headers['authorization'] = null;
        res.clearCookie('refresh-token');
        return res.status(200).json('Logged out successfully');
    }   catch (error) {
        return res.status(500).json('Server Internal error');
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    updatePassword,
    getProfile,
    refreshToken,
    sendOtp,
    loginWithGoogle,
    googleCallback,
    logout
}