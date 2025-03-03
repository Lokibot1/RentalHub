const express = require("express");
const jwt = require("jsonwebtoken");
const {connection: db } = require("../../configs/db"); // Adjust the path as needed

const router = express.Router();


/**
 * One-Time-Password Page
 * @route GET /auth/otp
 */
router.get("/", async (req, res) => {
    const email = req.query.email;

    // Check if email exists in the users table
    const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
        return res.status(400).json({ message: "Email does not exist" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log('otp generated:', otp)

    // Update OTP in users table
    const sql = "UPDATE users SET otp = ? WHERE email = ?";

    // Insert user into database
    await db.promise().query(sql, [otp, email]);

    // Save OTP in cookies
    res.cookie('otp', otp, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.render("partials/otp", {
        layout: "layouts/main",
        title: "OTP Page",
        isAuthenticated: req.isAuthenticated,
    });
});


/**
 * One-Time-Password Page
 * @route GET /auth/otp
 */
router.post("/verify", async (req, res) => {
    // Get OTP from the request body
    const { otp } = req.body;

    // Check if OTP matches the one in the session
    if (otp === req.cookies.otp) {

        // Check if email exists in the users table
        const [user] = await db.promise().query("SELECT * FROM users WHERE otp = ?", [otp]);

        if (user.length === 0) {
            return res.status(400).json({ message: "User account does not exist" });
        }

        // Set the token to cookie
        const token = jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, {expiresIn: "1h"});

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        })

        return res.json({ verified: true });
    } else {
        return res.status(400).json({ verified: false });
    }
})


module.exports = router;
