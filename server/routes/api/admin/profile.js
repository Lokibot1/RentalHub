import express from "express"
import { db } from "../../../configs/db.js"

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



/**
 * Update Profile
 * 
 * @route PATCH /api/admin/profile/update
 */
router.patch("/update", async (req, res) => {
    const {email, contact_number, social_media, address} = req.body

    const sql = `
            UPDATE users 
            SET 
                email = ?, 
                contact_number = ?,
                social_media = ?, 
                address = ? 
            WHERE role_id = 1
    `

    db.query(sql, [email, contact_number, social_media, address], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({
            success: true,
            message: `Admin profile updated!`
        });
    });
});


export default router
