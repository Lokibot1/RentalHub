import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


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
               profile_image
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
        WHERE items.category_id = ?
          AND items.is_approved = 1
          AND items.is_archived = 0
    `;

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
                };
            });

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});



export default router
