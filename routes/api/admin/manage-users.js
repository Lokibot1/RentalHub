const express = require("express");
const { connection: db } = require("../../../configs/db");

const router = express.Router();


/**
 * Get transactions data
 *
 * @route POST /api/admin/manage-users
 */
router.get("/", async (req, res) => {
    const sql = `
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM users
        WHERE users.role_id != 1
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


module.exports = router;
