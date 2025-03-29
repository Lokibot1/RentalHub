import express from "express"
import {db} from "../../../configs/db.js"

const router = express.Router();


/**
 * Get all items
 *
 * @route GET /api/shared/items
 */
router.get('/', async (req, res) => {
    const sql = 'SELECT * FROM items'

    db.query(sql, (err, results) => {
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
