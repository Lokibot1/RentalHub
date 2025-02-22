const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connection: db } = require("../../utils/db"); // Adjust the path as needed
const authenticateToken = require("../../middleware/authMiddleware"); // Import the middleware

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  db.connect(async (err) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      const { first_name, last_name, contact_number, email, password } = req.body;

      // Check if user already exists
      const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (first_name, last_name, contact_number, email, password) VALUES (?, ?, ?, ?, ?)";

        // Insert user into database
        await db.promise().query(sql, [
          first_name,
          last_name,
          contact_number,
          email,
          hashedPassword,
        ]);
      }

      res.status(201).json({ message: "User registered successfully" });
    }
  });
});

// User login route ✅
router.post("/login", async (req, res) => {
  db.connect(async (err) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      const { email, password } = req.body;

      const sql = "SELECT * FROM users WHERE email = ?";

      db.query(sql, [email], async (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" }); // If user not found
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compare(password, user.password); // Compare input password with stored hash

        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" }); // If password doesn't match
        }

        // Generate JWT token valid for 1 hour
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.json({ token, message: "Login successful" }); // Send token and success message
      });
    }
  });
});

// Protected route - only accessible with a valid token
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Access granted", user: req.user });
});

// Get all users (Testing purposes only) ✅
router.get("/all", async (req, res) => {
  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      // A simple SELECT query
      db.query(
        'SELECT * FROM `users`',
        function (err, results, fields) {
          console.log(results); // results contains rows returned by server
          console.log(fields); // fields contains extra meta data about results, if available
        }
      );

      res.status(201).json({ message: "Success" });
    }
  });

});

module.exports = router;