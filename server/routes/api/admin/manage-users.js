import express from "express"
import {db} from "../../../configs/db.js"

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
            return res.status(500).json({success: false, message: "Query failed."});
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
 * @route GET /api/admin/manage-users/:user_id
 */
router.get('/:user_id', async (req, res) => {
    const {user_id} = req.params;

    const selectUserSql = `
        SELECT DISTINCT users.id,
                        CONCAT(users.first_name, ' ', users.last_name) AS fullname,
                        users.email,
                        users.contact_number,
                        users.status                                   AS account_status,
                        COUNT(items.id)                                AS total_listing
        FROM users
                 JOIN items ON users.id = items.user_id
        WHERE items.is_archived = 0
          AND items.is_approved = 1
          AND users.id = ?
    `
    db.query(selectUserSql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Query failed."});
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
    const searchQuery = req.query.search;

    if (!searchQuery) {
        return res.status(400).json({success: false, message: "Search query is required."});
    }

    const sql = `
        SELECT users.id,
               CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM users
        WHERE users.role_id != 1
          AND (
                    users.first_name LIKE ? OR
                    users.last_name LIKE ? OR
                    CONCAT(users.first_name, ' ', users.last_name) LIKE ?
            )
    `;

    const searchParam = `%${searchQuery}%`;

    db.query(sql, [searchParam, searchParam, searchParam], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({success: false, message: "Query failed."});
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


/**
 * Get all reports
 *
 * @route GET /api/admin/manage-users/reports/all
 */
router.get("/reports/all", async (req, res) => {

    const sql = `
        SELECT DISTINCT users.id,
                        CONCAT(users.first_name, ' ', users.last_name) AS fullname
        FROM reports
                 JOIN users ON reports.reporter_id = users.id
    `

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({success: false, message: "Query failed."});
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
               reports.reasons                                AS report_reasons,
               reports.report_text                            AS description
        FROM reports
                 JOIN items ON reports.item_id = items.id
                 JOIN users ON reports.reporter_id = users.id
        WHERE reports.reporter_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database query error", err);
            return res.status(500).json({success: false, message: "Query failed."});
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


export default router
