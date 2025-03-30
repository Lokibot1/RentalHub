import express from "express"
import crypto from "crypto"
import {transporter, mailOptions} from "../../../../configs/mail.js"
import {db} from "../../../../configs/db.js"
import bcrypt from "bcryptjs";

const router = express.Router();


/**
 * Reset password
 *
 * @route POST /api/user/reset-password
 */
router.post('/', async (req, res) => {
    const { email, token, newPassword } = req.body;

    let sql = `SELECT id, password_reset_token FROM users WHERE email = ?`;

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Invalid email or token." });
        }

        const user = results[0];

        // Compare token (hashed)
        const isMatch = await bcrypt.compare(token, user.password_reset_token);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid reset link." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and remove reset token
        let updateSql = `UPDATE users SET password = ?, password_reset_token = NULL WHERE id = ?`;

        db.query(updateSql, [hashedPassword, user.id], (err) => {
            if (err) {
                console.error("Error updating password", err);
                return res.status(500).json({ success: false, message: "Error updating password." });
            }

            res.status(200).json({ success: true, message: "Password updated successfully." });
        });
    });
});



export default router
