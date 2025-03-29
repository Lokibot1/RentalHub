import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Get all items
 *
 * @route GET /api/shared/items
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
        SELECT *
        FROM items
        WHERE name LIKE ?
          AND is_approved = 1
          AND is_archived = 0
    `

    db.query(sql, [`%${keyword}%`], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
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


export default router
