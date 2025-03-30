import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router();


/**
 * Get transactions data
 *
 * @route GET /api/admin/manage-users
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

/**
 * Search users
 * 
 * @route GET /api/admin/manage-users/search
 */
router.get("/search", async (req, res) => {
    const searchQuery = req.query.search;
    
    if (!searchQuery) {
        return res.status(400).json({ success: false, message: "Search query is required." });
    }
    
    const sql = `
        SELECT 
            users.id, 
            CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM users
        WHERE 
            users.role_id != 1 AND
            (
                users.first_name LIKE ? OR 
                users.last_name LIKE ? OR
                CONCAT(users.first_name, ' ', users.last_name) LIKE ?
            )
    `;
    
    const searchParam = `%${searchQuery}%`;
    
    db.query(sql, [searchParam, searchParam, searchParam], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }
        
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

export default router
