import express from "express"
import crypto from "crypto"
import {transporter, mailOptions} from "../../../../configs/mail.js"
import {db} from "../../../../configs/db.js"
import bcrypt from "bcryptjs";

const router = express.Router();


/**
 * Forgot password
 *
 * @route POST /api/user/forgot-password
 */
router.post('/', async (req, res) => {
    const { email } = req.body;

    // Check if email exists
    let sql = `
        SELECT id, email
        FROM users
        WHERE email = ?
    `

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        if (results.length === 0) {
            return res.status(404).json({success: false, message: "Email not found."});
        }

        const user = results[0];

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex'); // Generate random token
        const hashedToken = await bcrypt.hash(resetToken, 10); // Hash for security

        // Store hashed token in the users table
        let updateSql = `UPDATE users
                         SET password_reset_token = ?
                         WHERE id = ?`;

        db.query(updateSql, [hashedToken, user.id], (err) => {
            if (err) {
                console.error("Error updating reset token", err);
                return res.status(500).json({success: false, message: "Error storing reset token."});
            }

            // Reset link (frontend should handle this)
            const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}&email=${email}`;

            // Email content
            mailOptions.to = user.email
            mailOptions.subject = "Password Reset Request"
            mailOptions.html = `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `

            // Send email
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error("Email sending error", error);
                    return res.status(500).json({success: false, message: "Error sending email."});
                }

                res.status(200).json({success: true, message: "Password reset link sent to email."});
            });
        });
    });
});


export default router
