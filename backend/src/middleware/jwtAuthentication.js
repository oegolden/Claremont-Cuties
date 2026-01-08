const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) return reject(new Error('No token provided'));
    jwt.verify(token, SECRET, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  // If not in header, try to get from cookies
  if (!token && req.cookies) {
    token = req.cookies.accessToken || req.cookies.token;
  }

  if (!token) return res.sendStatus(401); // No token provided

  try {
    const user = await verifyToken(token);
    req.user = user; // Add user info to the request object
    next();
  } catch (err) {
    return res.sendStatus(403); // Token expired or invalid
  }
}

module.exports = {
  authenticateToken,
  verifyToken,
};