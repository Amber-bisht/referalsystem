const jwt = require('jsonwebtoken');

//we check auth here 
// 401 if no token
// 401 if invalid token
// 200 if valid token
// 404 if user not found
// 500 if server error

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
