import express from "express"
import multer from 'multer'
import path from 'path'
import {db} from "../../../configs/db.js"
import {checkAuth} from "../../../middlewares/auth.js"
import fs from 'fs'

const router = express.Router();

const storagePath = process.env.STORAGE_PATH

// Ensure the directory exists
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});


/**
 * Update existing product without ongoing transaction
 *
 * @route PATCH /api/shared/update-product/:item_id
 */
router.patch("/:item_id", checkAuth, upload.single('item_file'), async (req, res) => {
    const { item_name, item_price, item_week_price, item_description, item_quantity, location, categories } = req.body;
    const item_id = req.params.item_id;
    const item_file = req.file; // Access the uploaded file
    let isApproved = false

    if (!item_file) {
        return res.status(400).json({success: false, message: "File upload failed."});
    }

    isApproved = req.user.role === 'admin';

    const sql = `
        UPDATE items
            JOIN inventory ON items.id = inventory.item_id
        SET
            items.name = ?,
            items.price = ?,
            items.price_per_week = ?,
            items.description = ?,
            inventory.stock_quantity = ?,
            items.location = ?,
            items.category_id = ?,
            items.file_path = ?,
            items.is_approved = ?
        WHERE items.id = ?
          AND NOT EXISTS (
            SELECT 1 FROM rental_transactions WHERE rental_transactions.item_id = items.id
        )
    `
    db.query(sql, [
        item_name,
        item_price,
        item_week_price,
        item_description,
        item_quantity,
        location,
        parseInt(categories),
        item_file.filename,
        isApproved ? 1 : 0,
        parseInt(item_id)
    ], (err) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Update failed." });
        }

        res.status(200).json({
            success: true,
            message: `Listing updated successfully!`
        });
    });
});


export default router
