const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get profile
 * 
 * @route GET /api/admin/profile
 */
router.get("/", async (req, res) => {
    const sql = `
            SELECT
                id,
                profile_image,
                first_name,
                created_at AS joined_date,
                email,
                contact_number,
                social_media,
                address
            FROM users
            WHERE role_id = 1
    `;
    db.query(sql, (err, results) => {
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


module.exports = router;
