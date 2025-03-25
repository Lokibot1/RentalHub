const express = require("express")
const jwt = require("jsonwebtoken")
const {connection: db} = require("../../../configs/db")

const router = express.Router()


/**
 * View pending items by user id
 *
 * @route GET /api/user/my-items/pending/:user_id
 */
router.get("/pending/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT items.id                                       AS product_id,
               items.name                                     AS product_name,
               items.price                                    AS product_price,
               items.file_path                                AS product_image,
               items.location                                 AS owner_location,
               inventory.stock_quantity                       AS product_quantity
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN inventory ON inventory.item_id = items.id
        WHERE users.id = ?
          AND is_approved = 0
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."})
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Get all approved items
 *
 * @route GET /api/user/my-items/approved/:user_id
 */
router.get("/approved/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT items.id                 AS item_id,
               items.name               AS item_name,
               items.price              AS item_price,
               items.location           AS item_location,
               items.file_path          AS item_image,
               inventory.stock_quantity AS item_quantity
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
        WHERE is_approved = 1
          AND is_archived = 0
          AND user_id = ?
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err)
            return res.status(500).json({success: false, message: "Query failed."})
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Decline rental request and keep the item in the "Rental Requests" tab
 *
 * @route PATCH /api/user/my-items/archive-item/:item_id
 */
router.patch("/archive-item/:item_id", (req, res) => {
    const { item_id } = req.params;

    if (!item_id) {
        return res.status(400).json({success: false, message: "Missing item id"});
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({success: false, message: "Transaction initiation failed."});

        // Update rental transaction to declined status (is_approved = -1)
        const updateTransactionSql = `
            UPDATE items
                LEFT JOIN rental_transactions ON items.id = rental_transactions.item_id
            SET items.is_archived = 1
            WHERE items.is_approved = 1
              AND rental_transactions.item_id IS NULL
              AND items.id = ?
        `
        db.query(updateTransactionSql, [item_id], (err) => {
            if (err) return rollback(res, "Failed to archive items because it has an existing rental transaction.");

            db.commit((err) => {
                if (err) return res.status(500).json({success: false, message: "Archive failed."});

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
 * @route GET /api/user/my-items/rental-requests/:user_id
 */
router.get("/rental-requests/:user_id", async (req, res) => {
    const {user_id} = req.params

    const sql = `
        SELECT rental_transactions.id                         AS rent_transaction_id,
               CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
               items.location                                 AS item_location,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               rental_transactions.start_date                 AS start_date,
               rental_transactions.end_date                   AS end_date,
               rental_transactions.mode_of_delivery           AS mode_of_delivery
        FROM rental_transactions
                 JOIN users ON users.id = rental_transactions.renter_id
                 JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 0
          AND rental_transactions.status != 'declined'
          AND items.user_id = ?
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."})
        }

        // Send back the results (the rental requests that are pending)
        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Update rental request to approved and update stock quantity
 *
 * @route PATCH /api/user/my-items/rental-requests/approved
 */
router.patch("/rental-requests/approved", (req, res) => {
    const {rental_transaction_id} = req.body

    if (!rental_transaction_id) {
        return res.status(400).json({success: false, message: "Missing rental_transaction_id"});
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({success: false, message: "Transaction initiation failed."});

        // Get item_id and rental_quantity
        const selectSql = `
            SELECT item_id, rental_quantity
            FROM rental_transactions
            WHERE id = ? FOR
            UPDATE
        `
        db.query(selectSql, [rental_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.")
            }

            const {item_id, rental_quantity} = results[0]

            // Approve rental request
            const updateTransactionSql = `
                UPDATE rental_transactions
                SET is_approved = 1,
                    status      = 'ongoing'
                WHERE id = ?
            `
            db.query(updateTransactionSql, [rental_transaction_id], (err) => {
                if (err) return rollback(res, "Failed to update rental transaction.")

                // Update inventory stock
                const updateInventorySql = `
                    UPDATE inventory
                    SET stock_quantity = stock_quantity - ?
                    WHERE item_id = ?
                      AND stock_quantity >= ?
                `
                db.query(updateInventorySql, [rental_quantity, item_id, rental_quantity], (err, results) => {
                    if (err || results.affectedRows === 0) {
                        return rollback(res, "Insufficient stock or update failed.")
                    }

                    db.commit((err) => {
                        if (err) return res.status(500).json({success: false, message: "Commit failed."});

                        res.status(200).json({
                            success: true,
                            message: 'Rental request approved, stock updated.'
                        })
                    })
                })
            })
        })
    })
})


/**
 * Decline rental request and keep the item in the "Rental Requests" tab
 *
 * @route PATCH /api/user/my-items/rental-requests/declined
 */
router.patch("/rental-requests/declined", (req, res) => {
    const {rental_transaction_id} = req.body;
    if (!rental_transaction_id) {
        return res.status(400).json({success: false, message: "Missing rental_transaction_id"});
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({success: false, message: "Transaction initiation failed."});

        // Update rental transaction to declined status (is_approved = -1)
        const updateTransactionSql = `
            UPDATE rental_transactions
            SET is_approved = 0,
                status      = 'declined'
            WHERE id = ?
        `

        db.query(updateTransactionSql, [rental_transaction_id], (err) => {
            if (err) return rollback(res, "Failed to decline rental transaction.");

            db.commit((err) => {
                if (err) return res.status(500).json({success: false, message: "Declined failed."});

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
    db.rollback(() => res.status(400).json({success: false, message}));
}


/**
 * Get ongoing transactions
 *
 * @route GET /api/user/my-items/ongoing-transactions/:user_id
 */
router.get("/ongoing-transactions/:user_id", async (req, res) => {
    const {user_id} = req.params

    const sql = `
        SELECT rental_transactions.id                         AS rent_transaction_id,
               CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               rental_transactions.start_date                 AS start_date,
               rental_transactions.end_date                   AS end_date,
               rental_transactions.mode_of_delivery           AS mode_of_delivery,
               rental_transactions.rental_quantity            AS rental_quantity,
               status
        FROM rental_transactions
                 JOIN users ON users.id = rental_transactions.renter_id
                 JOIN items ON items.id = rental_transactions.item_id
        WHERE rental_transactions.is_approved = 1
          AND status = 'ongoing'
          AND items.user_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."})
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Return ongoing items to shop including their quantity
 *
 * @route PATCH /api/user/my-items/return-items/:rent_transaction_id
 */
router.patch("/return-items/:rent_transaction_id", async (req, res) => {
    const {rent_transaction_id} = req.params;
    const {stars, description} = req.body
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({success: false, message: "Transaction initiation failed."});

        // Get item_id and rental_quantity
        const selectSql = `
            SELECT item_id, rental_quantity
            FROM rental_transactions
            WHERE id = ? FOR
            UPDATE
        `
        db.query(selectSql, [rent_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.");
            }

            const {item_id, rental_quantity} = results[0];

            // Delete transaction
            const deleteRentalTransactionById = `
                DELETE
                FROM rental_transactions
                WHERE id = ?
            `
            db.query(deleteRentalTransactionById, [rent_transaction_id], (err) => {
                if (err) return rollback(res, "Failed to delete rental transaction.")

                // Update inventory stock
                const updateInventorySql = `
                    UPDATE inventory
                    SET stock_quantity = stock_quantity + ?
                    WHERE item_id = ?
                `
                db.query(updateInventorySql, [rental_quantity, item_id], (err, results) => {
                    if (err || results.affectedRows === 0) {
                        return rollback(res, "Failed to update inventory.")
                    }

                    // Save reviews and star rating
                    const createReviewAndStarRatingSql = `
                        INSERT INTO reviews(item_id, user_id, rating, review_text)
                            VALUE (?, ?, ?, ?)
                    `
                    db.query(createReviewAndStarRatingSql, [item_id, user.id, stars, description], (err) => {
                        if (err) return rollback(res, "Failed to create reviews");

                        db.commit((err) => {
                            if (err) return res.status(500).json({
                                success: false,
                                message: "Commit failed."
                            });

                            res.status(200).json({
                                success: true,
                                message: 'Items returned and stock updated.'
                            })
                        })
                    })
                })
            })
        })
    })
})


module.exports = router
