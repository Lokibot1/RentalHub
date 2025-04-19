import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Get all items
 *
 * @route GET /api/shared/items
 */
router.get('/', async (req, res) => {

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
        WHERE items.is_approved = 1
          AND items.is_declined != 1
          AND items.is_archived != 1
        GROUP BY items.id, inventory.stock_quantity, items.user_id, users.first_name, users.last_name, profile_image
    `

    db.query(sql, (err, results) => {
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
 * Search items by keyword
 *
 * @route GET /api/shared/items/search?keyword=keyword
 */
router.get('/search', async (req, res) => {
    const { keyword, category } = req.query;

    let baseSQL = `
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
            JOIN categories ON categories.id = items.category_id
            LEFT JOIN reviews ON reviews.item_id = items.id
    `

    const conditions = [];
    const params = [];

    // Always exclude declined and archived items
    conditions.push('items.is_approved = 1')
    conditions.push('items.is_declined != 1')
    conditions.push('items.is_archived != 1')

    // Add search condition if keyword is provided
    if (keyword && keyword.trim() !== '') {
        conditions.push('(items.name LIKE ? OR items.description LIKE ?)');
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // Add category filter if it's not 'null' or empty
    if (category && category !== 'null' && category.trim() !== '') {
        conditions.push('categories.keyword = ?');
        params.push(category);
    }

    // Add WHERE clause if we have any conditions
    if (conditions.length > 0) {
        baseSQL += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add GROUP BY clause for AVG and grouping
    baseSQL += `
        GROUP BY items.id, inventory.stock_quantity, items.user_id, users.first_name, users.last_name, profile_image
    `;

    console.log('Final SQL:', baseSQL);
    console.log('Params:', params);

    db.query(baseSQL, params, (err, results) => {
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
 * Search item by item_id
 *
 * @route GET /api/shared/items/search-by/:item_id
 */
router.get('/search-by/:item_id', async (req, res) => {
    const {item_id} = req.params;

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
 * Get all items in a specific category
 *
 * @route GET /api/shared/items/category/:category_id?keyword=keyword
 */
router.get('/category/:category_id', async (req, res) => {
    // Get the category ID from the request
    const {category_id} = req.params;
    const {keyword} = req.query;

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
            return res.status(500).json({success: false, message: "Query failed."});
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
