import express from "express"
import { db } from "../../../../configs/db.js"

const router = express.Router();


/**
 * Get item owner
 *
 * @route GET /api/user/get-item/:item_id
 */
router.get("/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        SELECT *
        FROM items
        WHERE items.id = ?
    `

    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        });
    });
});


export default router
