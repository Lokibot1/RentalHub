import express from "express"
import {db} from "../../../configs/db.js"
import jwt from "jsonwebtoken"
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()
const storagePath = process.env.STORAGE_PATH

// Ensure the directory exists
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

/**
 * Update profile after OTP verified
 * @route PATCH /api/user/profile/setup
 */
router.patch("/setup", upload.single('profile_image'), async (req, res) => {
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const {middle_name, suffix, social_media, region, city, barangay, address, postal_code} = req.body
    const profile_image = req.file

    if (!profile_image) {
        return res.status(400).json({success: false, message: "File upload failed."});
    }

    const sql = `
        UPDATE users
        SET middle_name   = ?,
            suffix        = ?,
            social_media  = ?,
            region        = ?,
            city          = ?,
            barangay      = ?,
            address       = ?,
            postal_code   = ?,
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
            return res.status(500).json({success: false, message: "Update failed."});
        }

        res.status(200).json({
            success: true,
            message: `Set-up profile updated!`
        });
    });
});

// /**
//  * Update profile inside user dashboard
//  *
//  * @route PATCH /api/user/profile/update
//  */
// router.patch("/update", async (req, res) => {
//     const token = req.cookies.token || '';
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     const {profile_image, email, contact_number, social_media, address} = req.body

//     const sql = `
//         UPDATE users
//         SET profile_image  = ?,
//             email          = ?,
//             contact_number = ?,
//             social_media   = ?,
//             address        = ?
//         WHERE id = ?
//     `

//     db.query(sql, [
//         profile_image,
//         email,
//         contact_number,
//         social_media,
//         address,
//         user.id
//     ], (err) => {
//         if (err) {
//             console.error("Database not connected", err);
//             return res.status(500).json({success: false, message: "Update failed."});
//         }

//         res.status(200).json({
//             success: true,
//             message: `Profile updated!`
//         });
//     });
// });


/**
 * Update profile inside user dashboard
 *
 * @route PATCH /api/user/profile/update
 */
router.patch("/update", upload.single('profile_image'), async (req, res) => {
    try {
        const token = req.cookies.token || '';
        const user = jwt.verify(token, process.env.JWT_SECRET);

        const { email, contact_number, social_media, address } = req.body;
        let profile_image = null;

        if (req.file) {
            profile_image = req.file.filename; // Save filename only
        }

        let fieldsToUpdate = [];
        let values = [];

        if (profile_image) {
            fieldsToUpdate.push('profile_image = ?');
            values.push(profile_image);
        }

        if (email) {
            fieldsToUpdate.push('email = ?');
            values.push(email);
        }

        if (contact_number) {
            fieldsToUpdate.push('contact_number = ?');
            values.push(contact_number);
        }

        if (social_media) {
            fieldsToUpdate.push('social_media = ?');
            values.push(social_media);
        }

        if (address) {
            fieldsToUpdate.push('address = ?');
            values.push(address);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update." });
        }

        values.push(user.id);

        const sql = `
            UPDATE users
            SET ${fieldsToUpdate.join(', ')}
            WHERE id = ?
        `;

        db.query(sql, values, (err) => {
            if (err) {
                console.error("Database update error", err);
                return res.status(500).json({ success: false, message: "Update failed." });
            }

            res.status(200).json({
                success: true,
                message: "Profile updated successfully!",
            });
        });

    } catch (error) {
        console.error("Error during profile update", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
});



/**
 * Get Profile Info
 * @route GET /api/user/profile/:user_id
 */
router.get("/:user_id", async (req, res) => {
    const {user_id} = req.params

    const sql = `
        SELECT id,
               profile_image,
               CONCAT(first_name, ' ', middle_name, ' ', last_name) AS fullname,
               created_at                                           AS joined_date,
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
            return res.status(500).json({success: false, message: "Query failed."});
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
    const {middle_name, suffix, social_media, region, city, barangay, address, postal_code} = req.body

    const sql = `
        UPDATE users
        SET email          = ?,
            contact_number = ?,
            social_media   = ?,
            address        = ?
            WHERE id = ?
    `

    db.query(sql, [middle_name, suffix, social_media, region, city, barangay, address, postal_code, user.id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Update failed."});
        }

        res.status(200).json({
            success: true,
            message: `Set-up profile updated!`
        });
    });
});


/**
 * Get Review for Owner or Renter
 *
 * @route GET /api/user/profile/reviews/:user_id
 */
router.get("/reviews/:user_id", async (req, res) => {
    const {user_id} = req.params
    const {role} = req.query

    const sql = `
        SELECT reviews.id                                                                             AS id,
               users_reviewer.profile_image                                                           AS profile_image,
               CONCAT(users_reviewer.first_name, ' ', users_reviewer.last_name)                       AS renter,
               reviews.rating                                                                         AS stars,
               reviews.review_text,
               items.name                                                                             AS item_name,
               DATE(reviews.created_at)                                                               AS date_posted,
               CONCAT(users_reviewer.address, ' ', users_reviewer.barangay, ' ', users_reviewer.city) AS location
        FROM reviews
                 LEFT JOIN items ON reviews.item_id = items.id
                 LEFT JOIN users AS users_owner ON reviews.item_owner_id = users_owner.id
                 LEFT JOIN users AS users_renter ON reviews.item_renter_id = users_renter.id
                 LEFT JOIN users AS users_reviewer ON reviews.reviewer_id = users_reviewer.id
                 LEFT JOIN rental_transactions ON reviews.item_renter_id = rental_transactions.id
        WHERE reviews.for_user = ?
          AND reviews.role = ?
        ORDER BY reviews.created_at DESC
    `
    db.query(sql, [user_id, role], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})

/**
 * Get Review for Owner or Renter
 *
 * @route GET /api/user/profile/renter-info/:user_id
 */
router.get("/renter-info/:user_id", async (req, res) => {
    const {user_id} = req.params
    const {role} = req.query

    const sql = `
        SELECT reviews.id                                                                             AS id,
               users_reviewer.profile_image                                                           AS profile_image,
               CONCAT(users_reviewer.first_name, ' ', users_reviewer.last_name)                       AS renter,
               reviews.rating                                                                         AS stars,
               reviews.review_text,
               items.name                                                                             AS item_name,
               DATE(reviews.created_at)                                                               AS date_posted,
               CONCAT(users_reviewer.address, ' ', users_reviewer.barangay, ' ', users_reviewer.city) AS location
        FROM reviews
                 LEFT JOIN items ON reviews.item_id = items.id
                 LEFT JOIN users AS users_owner ON reviews.item_owner_id = users_owner.id
                 LEFT JOIN users AS users_renter ON reviews.item_renter_id = users_renter.id
                 LEFT JOIN users AS users_reviewer ON reviews.reviewer_id = users_reviewer.id
                 LEFT JOIN rental_transactions ON reviews.item_renter_id = rental_transactions.id
        WHERE reviews.for_user = ?
          AND reviews.role = ?
        ORDER BY reviews.created_at DESC
    `
    db.query(sql, [user_id, role], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


export default router
