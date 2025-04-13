import express from "express"
import { db } from "../../../configs/db.js"
import { sendNotification } from '../../../helpers/send-notification.js'; // Import your mailer utility

const router = express.Router();

/**
 * Get all pending items
 *
 * @route POST /api/admin/manage-listings/pending
 */
router.get("/pending", async (req, res) => {
    const sql = `
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS owner,
               items.id                                       AS item_id,
               items.name                                     AS item_name,
               categories.name                                AS category_name
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN categories
                      ON items.category_id = categories.id
        WHERE is_approved = 0
          AND is_declined = 0
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
 * View pending items
 *
 * @route GET /api/admin/manage-listings/pending/:item_id
 */
router.get("/pending/:item_id", async (req, res) => {
    const {item_id} = req.params

    const sql = `
        SELECT items.id                                       AS product_id,
               items.name                                     AS product_name,
               items.price                                    AS product_price,
               items.description                              AS product_description,
               items.file_path                                AS product_image,
               users.profile_image                            AS owner_image,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.location                                 AS owner_location,
               inventory.stock_quantity                       AS item_quantity
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN inventory ON inventory.item_id = items.id
        WHERE items.id = ?
          AND is_approved = 0;
    `;
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        });
    });
});


/**
 * Approve item
 *
 * @route POST /api/admin/manage-listings/approve/:item_id
 */
router.post("/approve/:item_id", async (req, res) => {
    const {item_id} = req.params
    const sql = "UPDATE items SET is_approved = 1 WHERE items.id = ?";

    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Update is_approved to true failed."});
        }

        res.status(200).json({
            success: true,
            message: `Item successfully updated!`
        });
    });
});


/**
 * View all approved items
 *
 * @route GET /api/admin/manage-listings
 */
router.get("/", async (req, res) => {
    const sql = `
        SELECT items.id                                       AS id,
               CONCAT(users.first_name, ' ', users.last_name) AS item_owner,
               items.name                                     AS item_name,
               categories.name                                AS item_category,
               inventory.stock_quantity                       AS item_availability
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
                 JOIN categories ON items.category_id = categories.id
        WHERE items.is_approved = 1;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    });
});


/**
 * View decline items
 *
 * @route GET /api/admin/manage-listings/decline-requests
 */
router.get("/decline-requests", async (req, res) => {
    const sql = `
        SELECT items.id                                       AS item_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               items.name                                     AS item_name,
               categories.name                                AS category_name
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN categories ON items.category_id = categories.id
        WHERE items.is_declined = 1
    `
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err)

            return res.status(500)
                .json({
                    success: false,
                    message: "Query failed"
                })
        }

        res.status(200)
            .json({
                success: true,
                data: results
            })
    })
})


/**
 * Decline item
 *
 * @route PATCH /api/admin/manage-listings/decline-requests/:item_id
 */
router.patch("/decline-requests/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        UPDATE items
        SET is_declined = 1
        WHERE items.id = ?
    `
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err)

            return res.status(500)
                .json({
                    success: false,
                    message: "Decline failed. Please try again."
                })
        }
    })

         const selectSql = `
                    SELECT 
                        i.id,
                        i.name AS item_name,
                        u.email AS owner_email
                    FROM items AS i
                    JOIN users AS u ON u.id = i.user_id
                    WHERE i.id = ?;
                `
        
                db.query(selectSql, [item_id], (err, results) => {
                    if (err || results.length === 0) {
                        return rollback(res, "Transaction details not found.")
                    }
        
        
                    const { item_name, owner_email, } = results[0];
        
        
                    const subject = 'Item Listing Declined';
                    const html = `
                                        <p>We regret to inform you that your listing for the item <strong>${item_name}</strong> has been declined.</p>
                                        <p>Unfortunately, it did not meet our company's guidelines and posting policies.<p>
                                        <p>We encourage you to review the item details and ensure they comply with our standards before submitting again.</p>
                                        <br>
                                        <br>
                                        <p>Thank you for your understanding.</p>
                                        <p><strong>- Management</strong><p>
                                    `
        
                    const template = { subject, html }
        
                    // Send approval notification email to item owner
                    sendNotification(owner_email, template);

        res.status(200)
            .json({
                success: true,
                message: `Item successfully declined!`
            })
    })
})


/**
 * View all declined requests
 *
 * @route GET /api/admin/manage-listings/declined-requests
 */
router.get("/declined-requests", async (req, res) => {
    const sql = `
        SELECT items.id                                       AS item_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               items.name                                     AS item_name,
               categories.name                                AS category_name
        FROM rental_transactions
                 JOIN items ON rental_transactions.item_id = items.id
                 JOIN users ON users.id = items.user_id
                 JOIN categories ON items.category_id = categories.id
        WHERE status = 'declined'
          AND rental_transactions.is_approved = 0
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    });
});

/**
 * Search listings and owners
 * 
 * @route GET /api/admin/manage-listings/search
 */
router.get("/search", async (req, res) => {
    const searchQuery = req.query.search;

    if (!searchQuery) {
        return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const sql = `
        SELECT items.id                                       AS item_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               items.name                                     AS item_name,
               categories.name                                AS category_name
        FROM items
                 JOIN users ON items.user_id = users.id
                 JOIN categories ON items.category_id = categories.id
        WHERE 
            items.is_approved = 1 AND
            (
                items.name LIKE ? OR 
                CONCAT(users.first_name, ' ', users.last_name) LIKE ? OR
                categories.name LIKE ?
            )
    `;

    const searchParam = `%${searchQuery}%`;

    db.query(sql, [searchParam, searchParam, searchParam], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });

});

export default router
