const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    const authHeaders = req.get('Authorization');
    let decodedToken;
    if(!authHeaders){
        req.isAuth = false;
        return next();
    }
    const token = authHeaders.split(' ')[1];

    try{
        decodedToken = jwt.verify(token, 'secret');
        if(!decodedToken){
            req.isAuth = false;
            return next();
        }
        req.isAuth = true;
        req.userId = decodedToken.userId;
        return next();
    }
    catch(err){
        req.isAuth = false;
        return next();
    }
};
