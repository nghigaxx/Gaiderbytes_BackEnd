const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../controllers/adminController')

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Access denied. Token is blacklisted." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;