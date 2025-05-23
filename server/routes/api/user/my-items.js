import express from "express"
import jwt from "jsonwebtoken"
import { db } from "../../../configs/db.js"
import { sendNotification } from '../../../helpers/send-notification.js'; // Import your mailer utility

const router = express.Router()


/**
 * View pending items by user id
 *
 * @route GET /api/user/my-items/pending/:user_id
 */
router.get("/pending/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT items.id                 AS product_id,
               items.name               AS product_name,
               items.price              AS product_price,
               items.file_path          AS product_image,
               items.location           AS owner_location,
               inventory.stock_quantity AS product_quantity
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN inventory ON inventory.item_id = items.id
        WHERE users.id = ?
          AND is_approved = 0
          AND is_declined != 1
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


/**
 * Get pending item
 *
 * @route GET /api/user/my-items/pending-item/:item_id
 */
router.get("/pending-item/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
            SELECT
                items.id AS product_id,
                items.file_path AS product_image,
                items.name AS product_name,
                items.location AS product_location,
                items.price AS product_price,
                items.description AS product_description,
                inventory.stock_quantity AS product_quantity
            FROM items
                JOIN inventory ON inventory.item_id = items.id
                JOIN users ON items.user_id = users.id
            WHERE items.id = ?
            AND items.is_approved = 0
            AND is_archived = 0
            AND is_declined = 0 
    `
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err)
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        })
    })
})


/**
 * Delete pending item
 *
 * @route DELETE /api/user/my-items/delete/pending-item/:item_id
 */
router.delete("/delete-pending-item/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        DELETE FROM items
        WHERE id = ?
          AND is_approved = 0
          AND is_archived = 0
          AND is_declined = 0
    `
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err)
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            message: "Item deleted successfully."
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
               inventory.stock_quantity AS item_quantity,
               COUNT(CASE WHEN reviews.for_user = items.user_id THEN 1 END) AS reviews_count
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 LEFT JOIN reviews ON reviews.item_id = items.id
        WHERE is_approved = 1
          AND is_archived = 0
          AND user_id = ?
        GROUP BY items.id, items.name, items.price, items.location, items.file_path, inventory.stock_quantity
        ORDER BY items.created_at DESC
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err)
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * ARCHIVE ITEMS
 *
 * @route PATCH /api/user/my-items/archive-item/:item_id
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
 * @route GET /api/user/my-items/rental-requests/:user_id
 */
router.get("/rental-requests/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS rent_transaction_id,
               CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
               users.address                                  AS renters_address,
               users.profile_image                            AS renters_profile_image,
               items.location                                 AS item_location,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               rental_transactions.rental_quantity            AS item_quantity,
               rental_transactions.created_at,
               rental_transactions.start_date                 AS start_date,
               rental_transactions.end_date                   AS end_date,
               rental_transactions.mode_of_delivery           AS mode_of_delivery
        FROM rental_transactions
                 JOIN users ON users.id = rental_transactions.renter_id
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN inventory ON inventory.item_id = items.id
        WHERE rental_transactions.is_approved = 0
          AND rental_transactions.status != 'declined'
          AND rental_transactions.status != 'voided'
          AND items.user_id = ?
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        // Send back the results (the rental requests that are pending)
        res.status(200).json({
            success: true,
            data: results
        })
    })
})

/**
 * Get renter information by rental transaction ID
 *
 * @route GET /api/user/my-items/renter-info-by-transaction/:transaction_id
 */
router.get("/renter-info-by-transaction/:transaction_id", async (req, res) => {
    const { transaction_id } = req.params;

    const sql = `
        SELECT 
            users.id AS renter_id,
            CONCAT(users.first_name, ' ', users.last_name) AS renter,
            users.profile_image AS renter_profile_image,
            users.contact_number,
            users.social_media,
            users.address AS city,
            (SELECT AVG(rating) FROM reviews WHERE renter_id = users.id) AS average_rating
        FROM rental_transactions
        JOIN users ON rental_transactions.renter_id = users.id
        WHERE rental_transactions.id = ?
    `;

    db.query(sql, [transaction_id], (err, results) => {
        if (err) {
            console.error("Database error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No renter info found." });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
});



/**
 * Update rental request to approved and update stock quantity
 *
 * @route PATCH /api/user/my-items/rental-requests/approved
 */
router.patch("/rental-requests/approved", (req, res) => {
    const { rental_transaction_id } = req.body

    if (!rental_transaction_id) {
        return res.status(400).json({ success: false, message: "Missing rental_transaction_id" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        const selectSql = `
            SELECT rt.item_id, rt.rental_quantity, i.user_id AS item_owner_id, rt.renter_id,
					i.name   AS item_name,
                   renter.email AS renter_email, i.is_archived,
                   owner.email  AS owner_email,
                   owner.contact_number,
                   owner.social_media
            FROM rental_transactions rt
                   JOIN items i ON rt.item_id = i.id
                   JOIN users AS renter ON renter.id = rt.renter_id
                   JOIN users AS owner ON owner.id = i.user_id
            WHERE rt.id = ? FOR UPDATE;
        `

        db.query(selectSql, [rental_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.")
            }

            const { item_id, item_name, rental_quantity, renter_email, contact_number, owner_email, social_media, is_archived } = results[0];

            if (is_archived) {
                console.log("Update failed. Item is archived.");
                return rollback(res, "Update failed. Item is archived.", 403);
            }

            const ownerContact = {
                contact_number,
                email: owner_email,
                social_media
            };

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

                    const subject = 'Rental Request Approved';
                    const html = `
                        <p>Your rental request for <strong>${item_name}</strong> has been approved.</p>
                        <p>Rental Quantity: ${rental_quantity}</p>
                        <p>Rental Transaction ID: ${rental_transaction_id}</p>
                        <p>Please contact the item owner using the information below for further details regarding the transaction:</p>
                        <ul>
                        <li><strong>Phone Number:</strong> ${ownerContact.contact_number}</li>
                        <li><strong>Email:</strong> ${ownerContact.email}</li>
                        <li><strong>Social Media:</strong> ${ownerContact.social_media}</li>
                        </ul>
                    `

                    const template = { subject, html }

                    // Send approval notification email to item owner
                    sendNotification(renter_email, template);


                    db.commit((err) => {
                        if (err) return res.status(500).json({ success: false, message: "Commit failed." });

                        res.status(200).json({
                            success: true,
                            message: 'Rental request approved, stock updated, and notification sent.'
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
    const { rental_transaction_id } = req.body;
    if (!rental_transaction_id) {
        return res.status(400).json({ success: false, message: "Missing rental_transaction_id" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        // First, update the transaction status
        const updateTransactionSql = `
            UPDATE rental_transactions
            SET is_approved = 0,
                status = 'declined'
            WHERE id = ?
        `;

        db.query(updateTransactionSql, [rental_transaction_id], (err) => {
            if (err) return rollback(res, "Failed to decline rental transaction.");

            // Now fetch item and transaction details to send notification
            const getTransactionDetailsSql = `
                SELECT 
                    i.id AS item_id,
                    i.name AS item_name,
                    rt.rental_quantity,
                    u.email AS renter_email,
                    u.contact_number,
                    u.email AS owner_email,
                    u.social_media
                FROM rental_transactions rt
                JOIN items i ON rt.item_id = i.id
                JOIN users u ON rt.renter_id = u.id
                WHERE rt.id = ?
            `;

            db.query(getTransactionDetailsSql, [rental_transaction_id], (err, results) => {
                if (err || results.length === 0) return rollback(res, "Failed to fetch transaction details.");

                const { item_name, rental_quantity, renter_email, contact_number, owner_email, social_media } = results[0];

                const ownerContact = {
                    contact_number,
                    email: owner_email,
                    social_media
                };

                const subject = 'Rental Request Declined';
                const html = `
                    <p>Your rental request for <strong>${item_name}</strong> has been <strong>declined</strong>.</p>
                    <p>Rental Quantity: ${rental_quantity}</p>
                    <p>Rental Transaction ID: ${rental_transaction_id}</p>
                    <p>You can contact the item owner for more information:</p>
                    <ul>
                        <li><strong>Phone Number:</strong> ${ownerContact.contact_number}</li>
                        <li><strong>Email:</strong> ${ownerContact.email}</li>
                        <li><strong>Social Media:</strong> ${ownerContact.social_media}</li>
                    </ul>
                `;

                const template = { subject, html };

                sendNotification(renter_email, template);

                db.commit((err) => {
                    if (err) return res.status(500).json({ success: false, message: "Decline commit failed." });

                    res.status(200).json({
                        success: true,
                        message: 'Rental request declined.'
                    });
                });
            });
        });
    });
});



// Helper function to rollback transaction
function rollback(res, message, status = 400) {
    db.rollback(() => res.status(status).json({ success: false, message }));
}


/**
 * Get OWNER ongoing transactions
 *
 * @route GET /api/user/my-items/ongoing-transactions/:user_id
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
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Create report
 *
 * @route POST /api/user/my-items/reports
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


/**
 * Return ongoing items to shop including their quantity
 *
 * @route PATCH /api/user/my-items/return-items/:rent_transaction_id
 */
router.patch("/return-items/:rent_transaction_id", async (req, res) => {
    const { rent_transaction_id } = req.params;
    const { stars, description } = req.body;
    const token = req.cookies.token || "";
    const user = jwt.verify(token, process.env.JWT_SECRET);

    db.beginTransaction((err) => {
        if (err)
            return res.status(500).json({
                success: false,
                message: "Transaction initiation failed.",
            });

        const selectSql = `
            SELECT rt.item_id, rt.rental_quantity, i.user_id as item_owner_id, rt.renter_id, rt.is_renter_submit_review
            FROM rental_transactions rt
            JOIN items i ON rt.item_id = i.id
            WHERE rt.id = ? FOR UPDATE;
        `;

        db.query(selectSql, [rent_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.");
            }

            const { item_id, rental_quantity, item_owner_id, renter_id } = results[0];

            // Save review and star rating
            const createReviewAndStarRatingSql = `
                INSERT INTO reviews(item_id, item_owner_id, reviewer_id, rating, review_text, for_user, role)
                VALUES (?, ?, ?, ?, ?, ?, 'renter')
            `;
            db.query(
                createReviewAndStarRatingSql,
                [item_id, item_owner_id, user.id, stars, description, renter_id],
                (err) => {
                    if (err) return rollback(res, "Failed to insert reviews.");

                    // Update transaction to mark owner as reviewed
                    const updateStatusToDone = `
                        UPDATE rental_transactions
                        SET is_owner_submit_review = 1,
                            status = 'done'
                        WHERE id = ?
                    `;
                    db.query(updateStatusToDone, [rent_transaction_id], (err) => {
                        if (err) return rollback(res, "Failed to update rental transactions");

                        // Proceed to update inventory since we just set is_owner_submit_review = 1
                        const updateInventorySql = `
                            UPDATE inventory
                            SET stock_quantity = stock_quantity + ?
                            WHERE item_id = ?
                              AND EXISTS (
                                SELECT 1
                                FROM rental_transactions
                                WHERE rental_transactions.item_id = inventory.item_id
                                  AND rental_transactions.id = ?
                                  AND rental_transactions.is_owner_submit_review = 1
                            )
                        `;

                        db.query(updateInventorySql, [rental_quantity, item_id, rent_transaction_id], (err, results) => {
                            if (err || results.affectedRows === 0) {
                                return rollback(res, "Failed to update inventory.");
                            }

                            db.commit((err) => {
                                if (err) {
                                    console.log("Commit failed:", err);
                                    return res.status(500).json({
                                        success: false,
                                        message: "Commit failed.",
                                    });
                                }

                                res.status(200).json({
                                    success: true,
                                    message: "Items returned, stock updated.",
                                });
                            });
                        });
                    });
                }
            );
        });
    });
});



export default router
