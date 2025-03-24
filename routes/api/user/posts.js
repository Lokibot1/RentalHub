const express = require('express')
const {connection: db} = require('../../../configs/db')

const router = express.Router()


/**
 * View pending items by item id
 * @route GET /api/user/posts/pending-item/:item_id
 */
router.get('/pending-item/:item_id', async (req, res) => {
    const { item_id } = req.params

    const sql = `
        SELECT
            items.id AS product_id,
            items.name AS product_name,
            items.price AS product_price,
            items.file_path AS product_image,
            items.description AS product_description,
            inventory.stock_quantity AS product_quantity,
            CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
            items.location AS owner_location
        FROM
            items
            JOIN users ON items.user_id = users.id
            JOIN inventory ON inventory.item_id = items.id
        WHERE
            items.id = ?
            AND is_approved = 0
    `
    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error('Database not connected', err)
            return res.status(500).json({success: false, message: 'Query failed.'})
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        })
    })
})

/**
 * Approve item
 * @route POST /api/user/posts/approve/:item_id
 */
router.post('/approve/:item_id', async (req, res) => {
    const { item_id } = req.params
    const sql = 'UPDATE items SET is_approved = 1 WHERE items.id = ?'

    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error('Database not connected', err)
            return res.status(500).json({success: false, message: 'Update is_approved to true failed.'})
        }

        res.status(200).json({
            success: true,
            message: `Item successfully updated!`
        })
    })
})


module.exports = router
