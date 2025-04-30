import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router();


/**
 * Get posted items
 *
 * @route GET /api/admin/my-items/posted-items
 */
router.get("/posted-items", async (req, res) => {
    const sql = `
        SELECT items.id        AS item_id,
               items.file_path AS item_image,
               name,
               price,
               stock_quantity,
               location
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN inventory ON items.id = inventory.item_id
        WHERE users.role_id = 1
          AND items.is_approved = 1
          AND items.is_archived = 0
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


/**
 * ARCHIVE ITEMS
 *
 * @route PATCH /api/admin/my-items/archive-item/:item_id
 */
router.patch("/archive-item/:item_id", (req, res) => {
    const { item_id } = req.params;

    if (!item_id) {
        return res.status(400).json({ success: false, message: "Missing item id" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        // Update rental transaction to declined status (is_approved = -1)
        const updateTransactionSql = `
            UPDATE items
            SET is_archived = 1
            WHERE is_approved = 1
              AND id = ?
              AND NOT EXISTS (
                  SELECT 1 FROM rental_transactions
                  WHERE rental_transactions.item_id = items.id
                    AND rental_transactions.status = 'ongoing'
              )
        `
        db.query(updateTransactionSql, [item_id], (err, result) => {
            if (err) return rollback(res, "Failed to archive items because it has an existing rental transaction.");

            if (result.affectedRows === 0) {
                return rollback(res, "Archive failed due to ongoing transactions.");
            }

            db.commit((err) => {
                if (err) return res.status(500).json({ success: false, message: "Archive failed." });

                res.status(200).json({
                    success: true,
                    message: 'Archived successfully!'
                });
            });
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
        SELECT rental_transactions.id                         AS rent_transaction_id,
               CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
               items.location                                 AS item_location,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               rental_transactions.start_date                 AS start_date,
               rental_transactions.end_date                   AS end_date,
               rental_transactions.mode_of_delivery           AS mode_of_delivery,
               rental_transactions.status
        FROM rental_transactions
                 JOIN users ON users.id = rental_transactions.renter_id
                 JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 0
          AND rental_transactions.status != 'declined'
          AND items.user_id = 1
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
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
 * @route PATCH /api/admin/my-listings/rental-requests/approved
 */
router.patch("/rental-requests/approved", (req, res) => {
    const {rental_transaction_id} = req.body;
    if (!rental_transaction_id) {
        return res.status(400).json({success: false, message: "Missing rental_transaction_id"});
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({success: false, message: "Transaction initiation failed."});

        // Get item_id and rental_quantity
        const selectSql = `SELECT item_id, rental_quantity
                           FROM rental_transactions
                           WHERE id = ? FOR
                           UPDATE`;
        db.query(selectSql, [rental_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.");
            }

            const {item_id, rental_quantity} = results[0];

            // Approve rental request
            const updateTransactionSql = `UPDATE rental_transactions
                                          SET is_approved = 1
                                          WHERE id = ?`;
            db.query(updateTransactionSql, [rental_transaction_id], (err) => {
                if (err) return rollback(res, "Failed to update rental transaction.");

                // Update inventory stock
                const updateInventorySql = `
                    UPDATE inventory
                    SET stock_quantity = stock_quantity - ?
                    WHERE item_id = ?
                      AND stock_quantity >= ?
                `;
                db.query(updateInventorySql, [rental_quantity, item_id, rental_quantity], (err, results) => {
                    if (err || results.affectedRows === 0) {
                        return rollback(res, "Insufficient stock or update failed.");
                    }

                    db.commit((err) => {
                        if (err) return res.status(500).json({success: false, message: "Commit failed."});

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


/**
 * Decline rental request and keep the item in the "Rental Requests" tab
 *
 * @route PATCH /api/admin/my-items/rental-requests/declined
 */
router.patch("/rental-requests/declined", (req, res) => {
    const { rental_transaction_id } = req.body;
    if (!rental_transaction_id) {
        return res.status(400).json({ success: false, message: "Missing rental_transaction_id" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        // Update rental transaction to declined status (is_approved = -1)
        const updateTransactionSql = `
            UPDATE rental_transactions
            SET is_approved = 0, status = 'declined'
            WHERE id = ?
        `

        db.query(updateTransactionSql, [rental_transaction_id], (err) => {
            if (err) return rollback(res, "Failed to decline rental transaction.");

            db.commit((err) => {
                if (err) return res.status(500).json({ success: false, message: "Declined failed." });

                res.status(200).json({
                    success: true,
                    message: 'Rental request declined.'
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
 * @route GET /api/admin/my-items/ongoing-transactions/:user_id
 */
router.get("/ongoing-transactions/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS rent_transaction_id,
               CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
               users.id                                       AS renter_id,
               users.address                                  AS renters_address,
               items.file_path                                AS item_image,
               item_id                                        AS item_id,
               items.name                                     AS item_name,
               items.location                                 AS item_location,
               rental_transactions.created_at,
               rental_transactions.start_date                 AS start_date,
               rental_transactions.end_date                   AS end_date,
               rental_transactions.mode_of_delivery           AS mode_of_delivery,
               rental_transactions.rental_quantity            AS rental_quantity,
               rental_transactions.status
        FROM rental_transactions
                 JOIN users ON users.id = rental_transactions.renter_id
                 JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 1
          AND rental_transactions.status = 'ongoing'
          AND rental_transactions.is_owner_submit_review = 0
          AND items.user_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


/**
 * Create report
 *
 * @route POST /api/admin/my-items/reports
 */
router.post("/reports", async (req, res) => {
    const {
        item_id,
        reported_user_id,
        reporter_id,
        reasons,
        report_text,
        status,
    } = req.body;

    const sql = `
        INSERT INTO reports (
            item_id,
            reported_user_id,
            reporter_id,
            reasons,
            report_text,
            status
        )
        SELECT
            ?, ?, ?, ?, ?,
            CASE
                WHEN u.status = 'banned' THEN 'banned'
                ELSE 'reported'
            END
        FROM users u
        WHERE u.id = ?
          AND NOT EXISTS (
              SELECT 1 FROM reports r
              WHERE r.item_id = ? AND r.reporter_id = ?
          )
    `
    db.query(sql, [item_id, reported_user_id, reporter_id, JSON.stringify(reasons), report_text, reported_user_id, item_id, reporter_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Create report failed." });
        }

        if (results.affectedRows === 0) {
            console.log(`User ${reporter_id} already reported item ${item_id}.`);
            return res.status(409).json({
                success: false,
                message: 'You have already reported this item.',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Report created successfully.',
        });
    });
});


export default router
