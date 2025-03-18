const express = require("express");
const {connection: db} = require("../../../configs/db");

const router = express.Router();


/**
 * Get rental requests
 *
 * @route GET /api/user/listings/rental-requests/:user_id
 */
router.get("/rental-requests/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT
            rental_transactions.id AS rent_transaction_id,
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


/**
 * Update rental request to approved and update stock quantity
 *
 * @route PATCH /api/user/listings/rental-requests/approved
 */
router.patch("/rental-requests/approved", (req, res) => {
    const { rental_transaction_id } = req.body;
    if (!rental_transaction_id) {
        return res.status(400).json({ success: false, message: "Missing rental_transaction_id" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        // Get item_id and rental_quantity
        const selectSql = `SELECT item_id, rental_quantity FROM rental_transactions WHERE id = ? FOR UPDATE`;
        db.query(selectSql, [rental_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.");
            }

            const { item_id, rental_quantity } = results[0];

            // Approve rental request
            const updateTransactionSql = `UPDATE rental_transactions SET is_approved = 1 WHERE id = ?`;
            db.query(updateTransactionSql, [rental_transaction_id], (err) => {
                if (err) return rollback(res, "Failed to update rental transaction.");

                // Update inventory stock
                const updateInventorySql = `
                    UPDATE inventory SET stock_quantity = stock_quantity - ? 
                    WHERE item_id = ? AND stock_quantity >= ?
                `;
                db.query(updateInventorySql, [rental_quantity, item_id, rental_quantity], (err, results) => {
                    if (err || results.affectedRows === 0) {
                        return rollback(res, "Insufficient stock or update failed.");
                    }

                    db.commit((err) => {
                        if (err) return res.status(500).json({ success: false, message: "Commit failed." });

                        res.status(200).json({
                            success: true,
                            message: 'Rental request approved, stock updated.'
                        });
                    });
                });
            });
        });
    });
});

// Helper function to rollback transaction
function rollback(res, message) {
    db.rollback(() => res.status(400).json({ success: false, message }));
}


/**
 * Get ongoing transactions
 *
 * @route GET /api/user/listings/ongoing-transactions/:user_id
 */
router.get("/ongoing-transactions/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT
            rental_transactions.id AS rent_transaction_id,
            CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
            items.file_path AS item_image,
            items.name AS item_name,
            rental_transactions.start_date AS start_date,
            rental_transactions.end_date AS end_date,
            rental_transactions.mode_of_delivery AS mode_of_delivery
        FROM rental_transactions
        JOIN users ON users.id = rental_transactions.renter_id
        JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 1 AND items.user_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})

module.exports = router
