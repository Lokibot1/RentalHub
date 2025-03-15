const express = require("express");
const { connection: db } = require("../../../configs/db");
const jwt = require("jsonwebtoken");

const router = express.Router();


/**
 * Get Profile Info
 * @route GET /api/user/profile/:user_id
 */
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
            SELECT
                id,
                profile_image,
                CONCAT(first_name, ' ', middle_name, ' ', last_name) AS fullname,
                created_at AS joined_date,
                email,
                contact_number,
                social_media,
                address
            FROM users
            WHERE id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        });
    });
});


/**
 * Update profile after OTP verified
 * @route POST /api/user/profile/setup
 */
router.post("/setup", async (req, res) => {
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { middle_name, suffix, social_media, region, city, barangay, address, postal_code } = req.body

    const sql = `
            UPDATE users 
            SET 
                middle_name = ?, 
                suffix = ?,
                social_media = ?, 
                region = ?, 
                city = ?, 
                barangay = ?, 
                address = ?, 
                postal_code = ? 
            WHERE id = ?
    `

    db.query(sql, [middle_name, suffix, social_media, region, city, barangay, address, postal_code, user.id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({
            success: true,
            message: `Set-up profile updated!`
        });
    });
});



/**
 * Update Profile
 * @route POST /api/user/profile/update
 */
router.post("/update", async (req, res) => {
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { middle_name, suffix, social_media, region, city, barangay, address, postal_code } = req.body

    const sql = `
            UPDATE users 
            SET 
                email = ?, 
                contact_number = ?,
                social_media = ?, 
                address = ?, 
            WHERE id = ?
    `

    db.query(sql, [middle_name, suffix, social_media, region, city, barangay, address, postal_code, user.id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({
            success: true,
            message: `Set-up profile updated!`
        });
    });
});
module.exports = router;
