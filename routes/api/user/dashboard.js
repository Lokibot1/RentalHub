const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get dashboard data
 * @route GET /api/user/dashboard/:user_id
 */
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params
    console.log(user_id)

    const sql = `
    SELECT 
        users.id AS user_id,
        (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND is_approved != 1) AS total_pending_posts,
        (SELECT COUNT(*) FROM items WHERE items.user_id = users.id AND is_approved = 1) AS total_items_posted,
        (SELECT COUNT(*) FROM rental_transactions WHERE is_approved = 1) AS total_items_rented,
        (SELECT COUNT(*) FROM rental_transactions WHERE is_approved = 0 AND users.id = ?) AS total_items_rent_request
        FROM users
        WHERE users.id = ?
    `;
    db.query(sql, [user_id, user_id], (err, results) => {
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
