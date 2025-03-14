const express = require("express");
const {connection: db} = require("../../../configs/db");

const router = express.Router();


/**
 * View pending items
 * @route GET /api/user/posts/pending/:user_id
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
    `;
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
 * Approve item
 * @route POST /api/user/posts/approve/:item_id
 */
router.post("/approve/:item_id", async (req, res) => {
    const { item_id } = req.params
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
 * Get all approved items
 * @route GET /api/user/posts/approve/:user_id
 */
router.get("/approve/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT
            items.id AS item_id,
            items.name AS item_name,
            items.price AS item_price,
            items.location AS item_location,
            items.file_path AS item_image,
            inventory.stock_quantity AS item_quantity
        FROM items
        JOIN inventory ON inventory.item_id = items.id
        WHERE is_approved = 1 AND user_id = ?
    `;

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
module.exports = router;
