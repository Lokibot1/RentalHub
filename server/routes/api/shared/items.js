import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Search items by keyword
 *
 * @route GET /api/shared/items/search?keyword=keyword
 */
router.get('/search', async (req, res) => {
    const { keyword } = req.query

    // Search query
    let sql = `
        SELECT items.id                 AS item_id,
               items.file_path          AS item_image,
               items.name               AS item_name,
               items.location           AS item_location,
               items.price              AS item_price,
               inventory.stock_quantity AS item_quantity
        FROM items
                 JOIN inventory ON items.id = inventory.item_id
        WHERE name LIKE ?
    `
    db.query(sql, [`%${keyword}%`], (err, results) => {
        if (err) {
            console.error("Database query error", err)
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        console.log('results', results)

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Get all items
 *
 * @route GET /api/shared/items/:category_id?keyword=keyword
 */
router.get('/:category_id', async (req, res) => {
    // Get the category ID from the request
    const { category_id } = req.params;
    const { keyword } = req.query;

    // Base SQL query
    let sql = `
        SELECT items.*,
               inventory.stock_quantity                       AS quantity,
               items.user_id                                  AS owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               profile_image,
               ROUND(AVG(reviews.rating), 2)                  AS average_rating
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
                 LEFT JOIN reviews ON reviews.item_id = items.id
        WHERE items.category_id = ?
          AND items.is_approved = 1
          AND items.is_archived = 0
        GROUP BY items.id, inventory.stock_quantity, items.user_id, users.first_name, users.last_name, profile_image
    `

    // If keyword exists, add the WHERE condition for name search
    const params = [category_id];
    if (keyword) {
        sql += ` AND items.name LIKE ? `;
        params.push(`%${keyword}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        const filteredResults = results.map(
            ({
                 id,
                 name,
                 price,
                 description,
                 location,
                 quantity,
                 file_path,
                 owner_id,
                 owner,
                 profile_image,
                average_rating
             }) => {
                return {
                    id,
                    name,
                    price,
                    description,
                    location,
                    quantity,
                    image: `/uploads/${file_path}`,
                    owner_id,
                    owner,
                    profile_image,
                    average_rating: average_rating ? parseFloat(average_rating).toFixed(2) : null
                };
            });

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});



export default router
