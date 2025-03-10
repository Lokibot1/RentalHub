const express = require("express");
const {connection: db} = require("../../configs/db");
const {checkAuth} = require("../../middlewares/auth"); // Adjust the path as needed

const router = express.Router();


/**
 * Get all pending items/listing
 * @route POST /api/posts/pending
 */
router.get("/pending", async (req, res) => {
    const sql = `
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS owner,
               items.id                                       AS item_id,
               items.name                                     AS item_name,
               categories.name                                AS category_name
        FROM items
                 Join users ON items.user_id = users.id
                 JOIN categories
                      ON items.category_id = categories.id
        WHERE is_approved = 0;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Failed to add item."});
        }

        const filteredResults = results.map(({owner, item_id, item_name, category_name}) => {
            return {
                owner,
                item_id,
                item_name,
                category_name
            }
        });
        // console.log(filteredResults);

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});

module.exports = router;
