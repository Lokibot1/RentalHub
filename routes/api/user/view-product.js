const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get dashboard data
 *
 * @route GET /api/user/view-product/posted-by/:item_id
 */
router.get("/posted-by/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        SELECT
            users.id AS id,
            profile_image,
            CONCAT(users.first_name, ' ', users.last_name) AS owner,
            contact_number,
            social_media,
            location
        FROM items
                 JOIN users ON users.id = items.user_id
        WHERE items.id = ?
    `

    db.query(sql, [item_id], (err, results) => {
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
