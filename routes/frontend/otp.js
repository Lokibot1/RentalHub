const express = require("express");
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

    res.render("partials/otp", {
        layout: "layouts/main",
        title: "OTP Page",
        isAuthenticated: req.isAuthenticated,
    });
});


/**
 * One-Time-Password Page
 * @route GET /auth/otp/verify
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

        return res.json({ verified: true });
    } else {
        return res.status(400).json({ verified: false });
    }
})


module.exports = router;
