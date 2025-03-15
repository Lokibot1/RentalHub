const express = require("express");
const {connection: db} = require("../../../configs/db");

const router = express.Router();


/**
 * Get rental requests
 * @route GET /api/user/listings/rental-requests/:user_id
 */
router.get("/rental-requests/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT
            items.id AS item_id,
            CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
            items.location AS item_location,
            items.file_path AS item_image,
            items.name AS item_name,
            rental_transactions.start_date AS start_date,
            rental_transactions.end_date AS end_date,
            rental_transactions.mode_of_delivery AS mode_of_delivery
        FROM rental_transactions
        JOIN users ON users.id = rental_transactions.renter_id
        JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 0 AND items.user_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
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
