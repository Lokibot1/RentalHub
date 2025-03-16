const express = require("express");
const { connection: db } = require("../../../configs/db");
const jwt = require("jsonwebtoken");
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const storagePath = process.env.STORAGE_PATH

// Ensure the directory exists
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * Update profile after OTP verified
 * @route PATCH /api/user/profile/setup
 */
router.patch("/setup", upload.single('profile_image'), async (req, res) => {
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { middle_name, suffix, social_media, region, city, barangay, address, postal_code } = req.body
    const profile_image = req.file

    if (!profile_image) {
        return res.status(400).json({ success: false, message: "File upload failed." });
    }

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
                postal_code = ?, 
                profile_image = ?
            WHERE id = ?
    `

    db.query(sql, [
        middle_name,
        suffix,
        social_media,
        region,
        city,
        barangay,
        address,
        postal_code,
        profile_image.filename,
        user.id
    ], (err) => {
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
 * Update profile inside user dashboard
 * 
 * @route PATCH /api/user/profile/update
 */
router.patch("/update", async (req, res) => {
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const { email, contact_number, social_media, address } = req.body

    const sql = `
            UPDATE users 
            SET 
                email = ?, 
                contact_number = ?, 
                social_media = ?, 
                address = ?
            WHERE id = ?
    `

    db.query(sql, [
        email,
        contact_number,
        social_media,
        address,
        user.id
    ], (err) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({
            success: true,
            message: `Profile updated!`
        });
    });
});


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
