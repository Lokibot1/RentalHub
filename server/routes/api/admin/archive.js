import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router()


/**
 * View archive items by user id
 *
 * @route GET /api/admin/archive/:user_id
 */
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT id,
               items.file_path AS image,
               name,
               price,
               location
        FROM items
        WHERE is_archived = 1
          AND is_approved = 1
          AND user_id = ?
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."})
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Restore item by id
 *
 * @route PATCH /api/admin/archive/restore-item/:item_id
 */
router.patch("/restore-item/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = "UPDATE items SET is_archived = 0 WHERE items.id = ?";
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."})
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


export default router
