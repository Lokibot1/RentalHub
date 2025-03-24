const express = require("express")
const {connection: db} = require("../../../configs/db")

const router = express.Router()


/**
 * View archive items by user id
 *
 * @route GET /api/user/archives/:user_id
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


module.exports = router
