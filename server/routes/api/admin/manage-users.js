import express from "express"
import { db } from "../../../configs/db.js"

const router = express.Router();


/**
 * Get all users
 *
 * @route GET /api/admin/manage-users
 */
router.get("/", async (req, res) => {
    const sql = `
        SELECT CONCAT(users.first_name, ' ', users.last_name) AS fullname, users.id
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
 * Get user details
 *
 * @route GET /api/admin/manage-users/get-user-by-id/:user_id
 */
router.get('/get-user-by-id/:user_id', async (req, res) => {
    const { user_id } = req.params;

    const selectUserSql = `
        SELECT users.id,
            CONCAT(users.first_name, ' ', users.last_name) AS fullname,
            users.email,
            users.contact_number,
            users.status AS account_status,
            COUNT(items.id) AS total_listing
        FROM users
        LEFT JOIN items 
            ON users.id = items.user_id 
            AND items.is_archived = 0 
            AND items.is_approved = 1
        WHERE users.id = ?
        GROUP BY users.id;
    `
    db.query(selectUserSql, [user_id], (err, results) => {
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


/**
 * Search users
 *
 * @route GET /api/admin/manage-users/search
 */
router.get("/search", async (req, res) => {
    const { keyword } = req.query

    let sql = `
        SELECT users.id,
               CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM users
        WHERE users.role_id != 1
    `

    const params = []

    // Only add search conditions if keyword exists
    if (keyword) {
        sql += `
            AND (
                users.first_name LIKE ? OR
                users.last_name LIKE ? OR
                CONCAT(users.first_name, ' ', users.last_name) LIKE ?
            )
        `
        const keywordParam = `%${keyword}%`
        params.push(keywordParam, keywordParam, keywordParam)
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." })
        }

        res.status(200).json({
            success: true,
            data: results
        })
    })
})


/**
 * Get all reports + search
 *
 * @route GET /api/admin/manage-users/reports/all?keyword=search_keyword
 */
router.get("/reports/all", async (req, res) => {
    const { keyword } = req.query;

    let sql = `
        SELECT DISTINCT reports.reporter_id,
                        reports.reported_user_id,
                        CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM reports
        JOIN users ON reports.reported_user_id = users.id
        WHERE reports.status = 'reported'
    `;

    const params = [];

    // Add keyword filter if provided
    if (keyword) {
        sql += `
            AND (
                users.first_name LIKE ? OR
                users.last_name LIKE ? OR
                CONCAT(users.first_name, ' ', users.last_name) LIKE ?
            )
        `;
        const keywordParam = `%${keyword}%`;
        params.push(keywordParam, keywordParam, keywordParam);
    }

    db.query(sql, params, (err, results) => {
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



/**
 * Get all reports by user_id
 *
 * @route GET /api/admin/manage-users/reports/:user_id
 */
router.get("/reports/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT reports.id,
               items.name                                     AS item_name,
               reports.created_at                             AS report_created,
               CONCAT(users.first_name, ' ', users.last_name) AS reporter_name,
               reports.reasons                                AS reasons,
               reports.report_text                            AS description
        FROM reports
                 JOIN items ON reports.item_id = items.id
                 JOIN users ON reports.reporter_id = users.id
        WHERE reports.reported_user_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: {
                total_reports: results.length,
                reports: results
            }
        });
    });
});


/**
 * Banned users
 *
 * @route GET /api/admin/manage-users/banned-users?keyword=search_keyword
 */
router.get("/banned-users/all", async (req, res) => {
    const { keyword } = req.query;

    let sql = `
        SELECT users.id                                       AS user_id,
               CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM users
        JOIN reports ON users.id = reports.reported_user_id
        WHERE users.status = 'banned'
          AND reports.status = 'banned'
    `;

    const params = [];

    // Add keyword filtering if provided
    if (keyword) {
        sql += `
            AND (
                users.first_name LIKE ? OR
                users.last_name LIKE ? OR
                CONCAT(users.first_name, ' ', users.last_name) LIKE ?
            )
        `;
        const keywordParam = `%${keyword}%`;
        params.push(keywordParam, keywordParam, keywordParam);
    }

    db.query(sql, params, (err, results) => {
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



/**
 * Ban by user_id
 *
 * @route PATCH /api/admin/manage-users/ban/:user_id
 */
router.patch("/ban/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const sql = `
        UPDATE users
            JOIN reports ON users.id = reports.reported_user_id
        SET users.status   = 'banned',
            reports.status = 'banned'
        WHERE users.id = ?
          AND reports.status = 'reported'
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            message: 'User banned successfully.',
        });
    });
});


/**
 * View user info by user_id
 *
 * @route GET /api/admin/manage-users/ban/view-user/:user_id
 */
router.get("/ban/view-user/:user_id", async (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT users.id                                                            AS user_id,
               CONCAT(users.first_name, ' ', users.last_name)                      AS fullname,
               users.email,
               users.status,
               -- Subquery to count items
               (SELECT COUNT(*) FROM items WHERE items.user_id = users.id)         AS total_items,
               -- Subquery to average ratings
               (SELECT ROUND(AVG(rating),1) FROM reviews WHERE reviews.for_user = users.id) AS average_rating
        FROM users
        WHERE users.id = ?
    `
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        })
    });
});


export default router
