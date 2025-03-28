import express from "express";

const router = express.Router();

// Load routes asynchronously before adding them to the router
const posts = await import("./posts.js").then(m => m.default);
const viewProduct = await import("./view-product.js").then(m => m.default);
const dashboard = await import("./dashboard.js").then(m => m.default);
const profile = await import("./profile.js").then(m => m.default);
const myRequests = await import("./my-requests.js").then(m => m.default);
const myItems = await import("./my-items.js").then(m => m.default);
const archives = await import("./archives.js").then(m => m.default);
const isOwner = await import("./utils/is-owner.js").then(m => m.default);
const getItem = await import("./utils/get-item.js").then(m => m.default);

// Route Prefix: /api/admin
router.use("/posts", posts);
router.use("/view-product", viewProduct);
router.use("/dashboard", dashboard);
router.use("/profile", profile);
router.use("/my-requests", myRequests);
router.use("/my-items", myItems);
router.use("/archives", archives);
router.use("/is-owner", isOwner);
router.use("/get-item", getItem);

export default router
