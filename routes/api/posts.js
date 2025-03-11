const express = require("express");
const {connection: db} = require("../../configs/db");

const router = express.Router();


/**
 * Get all pending items
 * @route POST /api/posts/pending
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
        WHERE is_approved = 0;
    `;
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
 * @route POST /api/posts/pending/:item_id
 */
router.get("/pending/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        SELECT items.id                                       AS product_id,
               items.name                                     AS product_name,
               items.price                                    AS product_price,
               items.description                              AS product_description,
               items.file_path                                AS product_image,
               users.profile_image                            AS owner_image,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.location                                 AS owner_location
        FROM items
                 Join users ON items.user_id = users.id
        WHERE items.id = ?
          AND is_approved = 0
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
 * @route POST /api/posts/approve/item_id
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

module.exports = router;
