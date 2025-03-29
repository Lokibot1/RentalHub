import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Get all items
 *
 * @route GET /api/shared/items?keyword=keyword
 */
router.get('/', async (req, res) => {
    // Get the category ID from the request
    const { keyword } = req.query;

    // Ensure keyword is not undefined
    if (!keyword) {
        return res.status(400).json({
            success: false,
            message: "Keyword is required"
        });
    }

    const sql = `
        SELECT items.*,
               inventory.stock_quantity                       AS quantity,
               items.user_id                                  AS owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               profile_image
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
        WHERE items.name LIKE ?
          AND items.is_approved = 1
          AND is_archived = 0
    `

    db.query(sql, [`%${keyword}%`], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
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
                }
            });

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});


export default router
