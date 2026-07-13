const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken:{
        type: String ,
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    }  
}, { timestamps: true });

userSchema.methods.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { id: this._id, username: this.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return token;
};  

userSchema.methods.generateRefreshToken = function() { 
    const refreshToken = jwt.sign(
        { id: this._id, username: this.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );  
    return refreshToken;
};


module.exports = mongoose.model('User', userSchema);