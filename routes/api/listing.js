const express = require("express");
const multer = require('multer')
const path = require('path');
const {connection: db } = require("../../configs/db");
const {checkAuth} = require("../../middlewares/auth"); // Adjust the path as needed
const fs = require('fs');

const router = express.Router();

const storagePath = process.env.STORAGE_PATH

// Ensure the directory exists
if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


/**
 * Add New Item
 * @route POST /api/listing
 */
router.post("/listing", checkAuth, upload.single('item_file'), async (req, res) => {
    const { item_name, item_price, item_description, item_quantity, location, categories } = req.body;
    const item_file = req.file; // Access the uploaded file
    let isApproved = false

    if (!item_file) {
        return res.status(400).json({ success: false, message: "File upload failed." });
    }

    if (req.user.role === 'admin') {
        isApproved = true
    } else {
        isApproved = false
    }

    // Begin transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction initiation failed:", err);
            return res.status(500).json({ success: false, message: "Transaction error." });
        }

        // Insert item into `items` table
        const insertItemSql = "INSERT INTO items (name, price, description, location, file_path, category_id, user_id, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(insertItemSql, [item_name, item_price, item_description, location, item_file.filename, categories, req.user.id, isApproved], (err, result) => {
            if (err) {
                console.error("Item insertion failed:", err);
                return db.rollback(() => {
                    res.status(500).json({ success: false, message: "Failed to add item." });
                });
            }

            const itemId = result.insertId; // Get the inserted item ID

            // Insert stock data into `inventory` table
            const insertInventorySql = "INSERT INTO inventory (item_id, stock_quantity) VALUES (?, ?)";
            db.query(insertInventorySql, [itemId, item_quantity], (err) => {
                if (err) {
                    console.error("Inventory insertion failed:", err);
                    return db.rollback(() => {
                        res.status(500).json({ success: false, message: "Failed to add item inventory." });
                    });
                }

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        console.error("Transaction commit failed:", err);
                        return db.rollback(() => {
                            res.status(500).json({ success: false, message: "Transaction error." });
                        });
                    }

                    res.status(201).json({ success: true, message: "Item added successfully with inventory." });
                });
            });
        });
    });
});



/**
 * Get all items/listing
 * @route GET /api/listing/:category_id
 */
router.get("/listing/:category_id", upload.single('item_file'), async (req, res) => {
    // Get the category ID from the request
    const { category_id } = req.params;

    const sql = `
        SELECT
            items.*,
            inventory.stock_quantity AS quantity,
            profile_image
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
        WHERE items.category_id = ?
          AND items.is_approved = 1
    `

    db.query(sql, [category_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Failed to add item." });
        }

        const filteredResults = results.map(({ id, name, price, description, location, quantity, file_path, profile_image }) => {
            return {
                id,
                name,
                price,
                description,
                location,
                quantity,
                image: `/uploads/${file_path}`,
                profile_image
            }
        });

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});

module.exports = router;
