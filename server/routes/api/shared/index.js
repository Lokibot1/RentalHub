import express from "express";

const router = express.Router();

// Load routes asynchronously before adding them to the router
const listing = await import("./listing.js").then(m => m.default);
const updateProduct = await import("./update-product.js").then(m => m.default);

// Route Prefix: /api/shared
router.use("/listing", listing);
router.use("/update-product", updateProduct);

export default router
