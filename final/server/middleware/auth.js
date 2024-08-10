const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = 'a3d2b6c7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9'; // Use a secure secret in production

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization token was found' });
    }
    const token = authHeader.replace('Bearer ', '');


    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin()) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { auth, isAdmin };
