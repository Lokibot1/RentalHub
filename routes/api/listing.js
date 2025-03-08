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
    const { item_name, item_price, item_description, location, categories } = req.body;
    const item_file = req.file; // Access the uploaded file

    if (!item_file) {
        return res.status(400).json({ success: false, message: "File upload failed." });
    }

    // Handle the received data and insert it into the database
    const sql = "INSERT INTO items (name, price, description, location, file_path, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [item_name, item_price, item_description, location, item_file.filename, categories, req.user.id], (err, result) => {
        if (err) {
            console.error("Database insertion failed:", err);
            return res.status(500).json({ success: false, message: "Failed to add item." });
        }
        res.status(201).json({ success: true, message: "Item added successfully." });
    });
});


/**
 * Get all items/listing
 * @route POST /api/listing
 */
router.get("/listing/:category_id", upload.single('item_file'), async (req, res) => {
    // Get the category ID from the request
    const { category_id } = req.params;

    // Handle the received data and insert it into the database
    const sql = "SELECT * FROM items where category_id = ?";
    db.query(sql, [category_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Failed to add item." });
        }

        const filteredResults = results.map(({ id, name, price, description, location, file_path }) => {
            return {
                id,
                name,
                price,
                description,
                location,
                image: `/uploads/${file_path}`
            }
        });
        // console.log(filteredResults);

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});

module.exports = router;
