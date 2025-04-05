import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { transporter, mailOptions } from "../../configs/mail.js"
import { db } from "../../configs/db.js"
import Joi from "joi"

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
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.pattern.base": "Password must include both letters and numbers.",
            "string.empty": "Password is required."
        }),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
        "any.only": "Password does not match!",
        "any.required": "Confirm password is required."
    })
});

/**
 * Register a new user
 *
 * @route POST /api/auth/register
 */
router.post("/register", async (req, res) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            errors: error.details.reduce((acc, curr) => {
                acc[curr.context.key] = curr.message;
                return acc;
            }, {})
        });
    }

    const { first_name, last_name, contact_number, email, password } = req.body;

    try {
        // Hash password before DB operations to reduce async bottlenecks
        const hashedPassword = await bcrypt.hash(password, 10);

        // Atomic Insert (Handles Duplicate Emails)
        const insertQuery = `
            INSERT INTO users (first_name, last_name, contact_number, email, password)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(insertQuery, [
            first_name, last_name, contact_number, email, hashedPassword
        ]);

        const userId = result.insertId;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        await db.promise().query("UPDATE users SET otp = ? WHERE email = ?", [otp, email]);

        // Set cookies safely
        res.cookie('otp', otp, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        // Generate JWT token
        const token = jwt.sign({ id: userId, email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });

        // Send Email (Ensures It's Awaited)
        mailOptions.to = email
        mailOptions.html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">RentalHub - OTP Verification</h2>
            <p>Good Day!</p>
            <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; color: #000;">
              ${otp}
            </div>
            <hr style="border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">RentalHub Team</p>
          </div>
        `

        try {
            await transporter.verify();
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("First attempt failed:", error);
            // Optional: Retry once after short delay
            await new Promise((res) => setTimeout(res, 1000)); // 1-second delay
            try {
                await transporter.sendMail(mailOptions);
            } catch (secondError) {
                console.error("Second attempt failed:", secondError);
                return res.status(500).json({ message: "Failed to send OTP email." });
            }
        }

        res.status(201).json({
            data: { email },
            message: "User registered successfully",
            token
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ errors: { email: "Email already used." } });
        }
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Profile setup schema validation
const profileSchema = Joi.object({
    middleName: Joi.string().allow('').optional(),
    suffix: Joi.string().allow('').optional(),
    socialMedia: Joi.string().allow('').optional(),
    region: Joi.string().required().messages({
        "string.empty": "Region is required."
    }),
    city: Joi.string().required().messages({
        "string.empty": "City is required."
    }),
    barangay: Joi.string().required().messages({
        "string.empty": "Barangay is required."
    }),
    postalCode: Joi.string().pattern(/^\d{4}$/).allow('').optional().messages({
        "string.pattern.base": "Postal code should be 4 digits."
    }),
    address: Joi.string().required().messages({
        "string.empty": "Street address is required."
    }),
    profileImage: Joi.string().required().messages({
        "string.empty": "Profile image is required."
    })
});

/**
 * Setup user profile
 * @route POST /api/auth/setup-profile
 */
router.post("/setup-profile", async (req, res) => {
    const { error } = profileSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.reduce((acc, curr) => {
            acc[curr.context.key] = curr.message;
            return acc;
        }, {});
        return res.status(400).json({ errors });
    }

    const { middleName, suffix, socialMedia, region, city, barangay, postalCode, address, profileImage } = req.body;

    // get the current user id from the token cookie
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);

    db.connect(async (err) => {
        if (err) {
            console.error("Database connection failed:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        const sql = `
            UPDATE users 
            SET middle_name = ?, suffix = ?, social_media = ?, region = ?, city = ?, barangay = ?, postal_code = ?, address = ?, profile_image = ?
            WHERE id = ?
        `;

        try {
            await db.promise().query(sql, [
                middleName,
                suffix,
                socialMedia,
                region,
                city,
                barangay,
                postalCode,
                address,
                profileImage,
                user.id,
            ]);

            res.status(200).json({ message: "Profile updated successfully" });
        } catch (error) {
            console.error("Query error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
});


/**
 * Login a user
 * @route POST /api/auth/login
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    db.connect(async (err) => {
        if (err) {
            console.error("Database connection failed:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        const sql = "SELECT users.id AS id, email, password, roles.name AS role FROM users INNER JOIN roles ON users.role_id = roles.id WHERE email = ?";
        db.query(sql, [email], async (err, results) => {
            if (err) {
                console.error("Query error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            }, process.env.JWT_SECRET, { expiresIn: "2h" });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict"
            });

            res.json({
                message: "Login successful",
                token,
            });
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
        return res.json({ isAuthenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ isAuthenticated: true, user: decoded });
    } catch (err) {
        return res.json({ isAuthenticated: false });
    }
});


export default router
