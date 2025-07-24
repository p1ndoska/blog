const jwt = require('jsonwebtoken');

const authenticationToken = (req,res,next)=>{

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: 'token required'});
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err){
            return res.status(401).json({error: 'invalid token'});
        }
        req.user = user;
        next();
    });


}

module.exports = {authenticationToken};