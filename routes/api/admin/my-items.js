const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get posted items - automatic approved
 *
 * @route GET /api/admin/my-items/posted-items
 */
router.get("/posted-items", async (req, res) => {
    const sql = `
        SELECT
            items.id AS item_id,
            items.file_path AS item_image,
            name,
            price,
            stock_quantity,
            location
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN inventory ON items.id = inventory.item_id
        WHERE users.role_id = 1 AND items.is_approved = 1
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


module.exports = router;
