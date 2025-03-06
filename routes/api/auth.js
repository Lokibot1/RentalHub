const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {connection: db } = require("../../configs/db"); // Adjust the path as needed
const Joi = require("joi");

const router = express.Router();

// Register schema validation
const registerSchema = Joi.object({
    first_name: Joi.string().required().messages({
        "string.empty": "First name is required."
    }),
    last_name: Joi.string().required().messages({
        "string.empty": "Last name is required."
    }),
    contact_number: Joi.string().pattern(/^\d{10,12}$/).required().messages({
        "string.pattern.base": "Contact number must be 10-12 digits.",
        "string.empty": "Contact number is required."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Enter a valid email address.",
        "string.empty": "Email is required."
    }),
    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().messages({
        "string.pattern.base": "Password must be at least 8 characters, include letters and numbers.",
        "string.empty": "Password is required."
    }),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
        "any.only": "Password does not match!",
        "any.required": "Confirm password is required."
    })
});

/**
 * Register a new user
 * @route POST /api/auth/register
 */
router.post("/register", async (req, res) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.reduce((acc, curr) => {
            acc[curr.context.key] = curr.message;
            return acc;
        }, {});
        return res.status(400).json({ errors });
    }

    const { first_name, last_name, contact_number, email, password } = req.body;

    db.connect(async (err) => {
        if (err) {
            console.error("Database connection failed:", err);
        } else {
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