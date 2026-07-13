const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res , next)=>{
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
    if(!token){
        return res.status(401).json({message: 'No token provided'});
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    }catch(err){
        return res.status(401).json({message: 'Invalid token'});
    }
}

module.exports = isLoggedIn;