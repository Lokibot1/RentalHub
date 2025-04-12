import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Search item by item_id
 *
 * @route GET /api/shared/items/:item_id
 */
router.get('/:item_id', async (req, res) => {
    const { item_id } = req.params;

    const sql = `
        SELECT items.id,
               items.file_path                                AS image,
               items.name,
               items.description,
               items.location,
               items.price,
               inventory.stock_quantity                       AS quantity,
               items.user_id                                  AS owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               profile_image,
               ROUND(AVG(reviews.rating), 2)                  AS average_rating
        FROM items
                 JOIN inventory ON items.id = inventory.item_id
                 JOIN users ON users.id = items.user_id
                 LEFT JOIN reviews ON reviews.item_id = items.id
        WHERE items.id = ?
        GROUP BY items.id, inventory.stock_quantity, items.user_id, users.first_name, users.last_name, profile_image
    `

    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({
                success: false,
                message: "Query failed."
            });
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        });
    });
});

/**
 * Search items by keyword
 *
 * @route GET /api/shared/items/search?keyword=keyword
 */
router.get('/search', async (req, res) => {
    const { keyword } = req.query;

    // If keyword is missing or empty string, return empty array
    if (!keyword || keyword.trim() === '') {
        return res.status(200).json({
            success: true,
            data: [] // return empty result set
        });
    }

    const sql = `
        SELECT items.id,
               items.file_path          AS image,
               items.name,
               items.description,
               items.location,
               items.price,
               inventory.stock_quantity AS quantity,
               items.user_id                                  AS owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               profile_image,
               ROUND(AVG(reviews.rating), 2)                  AS average_rating
        FROM items
                 JOIN inventory ON items.id = inventory.item_id
                 JOIN users ON users.id = items.user_id
                 LEFT JOIN reviews ON reviews.item_id = items.id
        WHERE (name LIKE ? OR description LIKE ?)
          AND name IS NOT NULL AND name <> ''
          AND description IS NOT NULL AND description <> ''
        GROUP BY items.id, inventory.stock_quantity, items.user_id, users.first_name, users.last_name, profile_image
    `;

    db.query(sql, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({
                success: false,
                message: "Query failed."
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


/**
 * Get all items in a specific category
 *
 * @route GET /api/shared/items/category/:category_id?keyword=keyword
 */
router.get('/category/:category_id', async (req, res) => {
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
                    image: file_path,
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
