const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1]; // Get token from request header
console.log(req.headers);
console.log(token);

  if (!token) return res.status(401).json({ message: "Access Denied" }); // If no token, deny access

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" }); // If invalid token, reject request
    req.user = user; // Attach user info to request object
    next(); // Move to the next middleware
  });
};

module.exports = authenticateToken;