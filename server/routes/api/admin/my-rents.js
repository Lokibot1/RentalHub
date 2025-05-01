import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router();


/**
 * Get rent request items
 * 
 * @route GET /api/admin/my-rents/requests/:role_id
 */
router.get("/requests/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               items.location                                 AS item_location,
               rental_quantity                                AS item_quantity,
               rental_transactions.created_at                 AS created_at,
               start_date                                     AS start_date,
               end_date                                       AS end_date
        FROM rental_transactions
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN users ON users.id = items.user_id
        WHERE rental_transactions.is_approved = 0
          AND rental_transactions.status != 'declined'
          AND rental_transactions.status != 'voided'
          AND rental_transactions.renter_id = ?
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
 * Cancel (delete) a rent request
 * 
 * @route DELETE /api/admin/my-rents/cancel/:request_id
 */
router.delete("/cancel/:request_id", (req, res) => {
    const { request_id } = req.params;
    
    const deleteSql = `
        DELETE FROM rental_transactions 
        WHERE id = ?
    `;
    
    db.query(deleteSql, [request_id], (err, results) => {
        if (err) {
            console.error("Database error during deletion:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to delete the request." 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: "Request successfully canceled." 
        });
    });
});

/**
 * Get ongoing rent items
 * 
 * @route GET /api/admin/my-rents/ongoing/:role_id
 */
router.get("/ongoing/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS id,
               rental_transactions.renter_id,
               items.id                                       AS item_id,
               items.user_id                                  AS item_owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               items.location                                 AS item_location,
               rental_quantity                                AS item_quantity,
               rental_transactions.created_at                 AS created_at,
               start_date                                     AS start_date,
               end_date                                       AS end_date,
               mode_of_delivery
        FROM rental_transactions
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN users ON users.id = items.user_id
        WHERE rental_transactions.is_approved = 1
          AND rental_transactions.is_renter_submit_review = 0
          AND rental_transactions.renter_id = ?
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
 * Rent item
 *
 * @route POST /api/admin/my-rents
 */
router.post("/", async (req, res) => {
    const {
        renter_id,
        id: item_id,
        start_date,
        end_date,
        price,
        rental_quantity,
        mode_of_delivery
    } = req.body;

    const total_price = parseFloat(price) * parseInt(rental_quantity, 10);

    const insertSql = `
        INSERT INTO rental_transactions (
            renter_id, item_id, start_date, end_date, total_price, rental_quantity, mode_of_delivery
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [
        renter_id,
        item_id,
        start_date,
        end_date,
        total_price,
        rental_quantity,
        mode_of_delivery,
    ], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Insert query failed." });
        }

        // Send response only once after both queries are successful
        res.status(200).json({
            success: true,
            message: "Item rental transaction saved"
        });
    });
});

export default router
