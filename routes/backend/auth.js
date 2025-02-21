const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../utils/db-connection"); // Adjust the path as needed

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization"); // Get token from request header

  if (!token) return res.status(401).json({ message: "Access Denied" }); // If no token, deny access

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" }); // If invalid token, reject request
    req.user = user; // Attach user info to request object
    next(); // Move to the next middleware
  });
};

// User login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" }); // If user not found
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare input password with stored hash

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" }); // If password doesn't match
    }

    // Generate JWT token valid for 1 hour
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, message: "Login successful" }); // Send token and success message
  });
});

// Protected route - only accessible with a valid token
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Access granted", user: req.user });
});

module.exports = router;