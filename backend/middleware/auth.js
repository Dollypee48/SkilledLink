const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;
  if (!token || token.trim() === '') {
    return res.status(401).json({ message: 'No valid token provided' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('Auth Middleware Error: JWT_SECRET not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error: JWT secret not set' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth Middleware - JWT Verification Error:', err);
 
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token signature' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;