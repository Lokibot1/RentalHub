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
 * Add New Item
 *
 * @route POST /api/shared/listing
 */
router.post("/", checkAuth, upload.single('item_file'), async (req, res) => {
    const {item_name, item_price, item_description, item_quantity, location, categories} = req.body;
    const item_file = req.file; // Access the uploaded file
    let isApproved = false

    if (!item_file) {
        return res.status(400).json({success: false, message: "File upload failed."});
    }

    isApproved = req.user.role === 'admin';

    // Begin transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction initiation failed:", err);
            return res.status(500).json({success: false, message: "Transaction error."});
        }

        // Insert item into `items` table
        const insertItemSql = "INSERT INTO items (name, price, description, location, file_path, category_id, user_id, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(insertItemSql, [item_name, item_price, item_description, location, item_file.filename, categories, req.user.id, isApproved], (err, result) => {
            if (err) {
                console.error("Item insertion failed:", err);
                return db.rollback(() => {
                    res.status(500).json({success: false, message: "Failed to add item."});
                });
            }

            const itemId = result.insertId; // Get the inserted item ID

            // Insert stock data into `inventory` table
            const insertInventorySql = "INSERT INTO inventory (item_id, stock_quantity) VALUES (?, ?)";
            db.query(insertInventorySql, [itemId, item_quantity], (err) => {
                if (err) {
                    console.error("Inventory insertion failed:", err);
                    return db.rollback(() => {
                        res.status(500).json({success: false, message: "Failed to add item inventory."});
                    });
                }

                // Commit transaction
                db.commit((err) => {
                    if (err) {
                        console.error("Transaction commit failed:", err);
                        return db.rollback(() => {
                            res.status(500).json({success: false, message: "Transaction error."});
                        });
                    }

                    res.status(201).json({success: true, message: "Item added successfully with inventory."});
                });
            });
        });
    });
});


/**
 * Get all items/listing
 *
 * @route GET /api/shared/listing/:category_id
 */
router.get("/:category_id", upload.single('item_file'), async (req, res) => {
    // Get the category ID from the request
    const {category_id} = req.params;

    const sql = `
        SELECT items.*,
               inventory.stock_quantity                       AS quantity,
               items.user_id                                  AS owner_id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner,
               profile_image
        FROM items
                 JOIN inventory ON inventory.item_id = items.id
                 JOIN users ON users.id = items.user_id
        WHERE items.category_id = ?
          AND items.is_approved = 1
          AND is_archived = 0
    `

    db.query(sql, [category_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({success: false, message: "Failed to add item."});
        }

        const filteredResults = results.map(
            ({
                 id,
                 name,
                 price,
                 description,
                 location,
                 quantity,
                 file_path,
                 owner_id,
                 owner,
                 profile_image,
                 category_id
             }) => {
                return {
                    id,
                    name,
                    price,
                    description,
                    location,
                    quantity,
                    image: `/uploads/${file_path}`,
                    owner_id,
                    owner,
                    profile_image,
                    category_id
                }
            });

        res.status(200).json({
            success: true,
            data: filteredResults
        });
    });
});


/**
 * Get Items/Listing that is searched
 *
 * @route GET /api/shared/listing/:category_id
 */
router.get("/listing/:categoryId", async (req, res) => {
    const categoryId = req.params.categoryId;
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let sql = "SELECT * FROM listings WHERE category_id = ?";
    let params = [categoryId];

    if (searchQuery) {
        const searchTerms = searchQuery.split(' ').map(term => `%${term}%`);
        const conditions = searchTerms.map(() => "(name LIKE ? OR owner_name LIKE ?)").join(" AND ");
        sql += ` AND ${conditions}`;
        params.push(...searchTerms.flatMap(term => [term, term])); 
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
        
        res.json({ success: true, data: results });
    });
});


export default router
