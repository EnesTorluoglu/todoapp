const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

const SECRET_KEY = "secret";

async function authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = await User.findById(decoded.userId);
        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
}

module.exports = authenticate;
