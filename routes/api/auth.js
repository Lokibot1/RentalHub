const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {connection: db } = require("../../configs/db"); // Adjust the path as needed

const router = express.Router();


/**
 * Register a new user
 * @route POST /api/auth/register
 */
router.post("/register", async (req, res) => {
    const {first_name, last_name, contact_number, email, password, confirm_password} = req.body
    let errors = {}

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address."
    }

    //  Validate Password Strength (8+ characters, at least one letter and number)
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        errors.password = "Password must be at least 8 characters, include letters and numbers."
    } else if (password !== confirm_password) {
        errors.password = "Password does not match!"
    }

    // Validate contact number
    if (!/^\d{10,12}$/.test(contact_number)) {
        errors.contact_number = "Contact number must be 10-12 digits."
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({errors})
    }

    db.connect(async (err) => {
        if (err) {
            console.error("Database connection failed:", err);
        } else {
            // Check if user already exists
            const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

            if (existingUser.length > 0) {
                return res.status(400).json({
                    errors: {
                        email: "Email already used. Please try another email."
                    }
                });
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
                    hashedPassword
                ]);
            }

            res.status(201).json({
                data: { email },
                message: "Created OTP"
            });
        }
    });

});


/**
 * Login a user
 * @route POST /api/auth/login
 */
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    db.connect(async (err) => {
        if (err) {
            console.error("Database connection failed:", err);
            return res.status(500).json({message: "Internal server error"});
        }

        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("Query error:", err);
                return res.status(500).json({message: "Internal server error"});
            }

            if (results.length === 0) {
                return res.status(400).json({message: "Invalid email or password"});
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({message: "Invalid email or password"});
            }

            const token = jwt.sign({
                id: user.id,
                email: user.email,
            }, process.env.JWT_SECRET, {expiresIn: "1h"});

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict"
            });
            res.json({message: "Login successful", token});
        });
    });
});


/**
 * Check if user is authenticated
 * @route POST /api/auth/check-auth
 */
router.post("/check-auth", (req, res) => {
    const token = req.cookies.token || '';

    if (!token) {
        return res.json({isAuthenticated: false});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({isAuthenticated: true, user: decoded});
    } catch (err) {
        return res.json({isAuthenticated: false});
    }
});



module.exports = router;