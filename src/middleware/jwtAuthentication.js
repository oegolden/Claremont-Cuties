const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  // If not in header, try to get from cookies
  if (!token && req.cookies) {
    token = req.cookies.accessToken || req.cookies.token;
  }

  if (!token) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token expired or invalid
    
    req.user = user; // Add user info to the request object
    next();
  });
}

module.exports = authenticateToken;