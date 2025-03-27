import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router();


/**
 * Get transactions data
 *
 * @route POST /api/admin/transactions
 */
router.get("/", async (req, res) => {
    const sql = `
        SELECT
            rental_transactions.id AS transaction_id,
            items.name AS item_name,
            rental_transactions.start_date,
            rental_transactions.end_date,
            CONCAT(renter.first_name, ' ', renter.last_name) AS renter,
            CONCAT(owner.first_name, ' ', owner.last_name) AS owner
        FROM rental_transactions
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN users AS renter ON renter.id = rental_transactions.renter_id  -- Getting renter details
                 JOIN users AS owner ON owner.id = items.user_id  -- Getting owner details
        WHERE rental_transactions.is_approved = 1
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


export default router
