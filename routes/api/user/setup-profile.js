const express = require("express");
const { connection: db } = require("../../../configs/db");
const jwt = require("jsonwebtoken");

const router = express.Router();



/**
 * Approve item
 * @route POST /api/user/setup-profile
 */
router.post("/", async (req, res) => {
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

module.exports = router;
