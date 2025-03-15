const express = require("express");
const {connection: db} = require("../../../configs/db");

const router = express.Router();


/**
 * Get rent items
 * @route GET /api/user/rent/:user_id
 */
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT
            items.id AS item_id,
            CONCAT(users.first_name, ' ', users.last_name) AS renters_name,
            items.name AS item_name,
            items.file_path AS item_image
        FROM rental_transactions
        JOIN users ON users.id = rental_transactions.renter_id
        JOIN items ON items.id = rental_transactions.item_id
        WHERE items.user_id = ?
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
 * @route POST /api/user/rent
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

        const updateSql = "UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE item_id = ?";

        db.query(updateSql, [rental_quantity, item_id], (err, results) => {
            if (err) {
                console.error("Database not connected", err);
                return res.status(500).json({ success: false, message: "Update query failed." });
            }

            // Send response only once after both queries are successful
            res.status(200).json({
                success: true,
                message: "Item rental transaction saved and stock quantity updated!"
            });
        });
    });
});


module.exports = router;
