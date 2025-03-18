const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get posted items
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


/**
 * Get rental requests
 *
 * @route GET /api/admin/my-items/rental-requests
 */
router.get("/rental-requests", async (req, res) => {
    const sql = `
        SELECT
            items.id AS id,
            CONCAT(renter.first_name, ' ', renter.last_name) AS renters_name,
            location,
            items.file_path AS item_image,
            items.name AS item_name,
            start_date,
            end_date,
            mode_of_delivery
        FROM items
                 JOIN rental_transactions ON items.id = rental_transactions.item_id
                 JOIN users AS renter ON rental_transactions.renter_id = renter.id
        WHERE items.user_id = 1 AND rental_transactions.is_approved = 0
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
