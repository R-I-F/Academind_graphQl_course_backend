const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    const authHeaders = req.get('Authorization');
    let decodedToken;
    if(!authHeaders){
        const error = new Error('Unauthorized token header.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeaders.split(' ')[1];

    try{
        decodedToken = jwt.verify(token, 'secret');
    }
    catch(err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error('Unauthorized token.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};