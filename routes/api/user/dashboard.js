const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get dashboard data
 * @route POST /api/user/dashboard
 */
router.get("/dashboard", async (req, res) => {
    const sql = `
    SELECT 
        (SELECT COUNT(*) FROM items WHERE is_approved != 1) AS total_pending_posts,
        (SELECT COUNT(*) FROM items WHERE is_approved = 1) AS total_items_posted
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
