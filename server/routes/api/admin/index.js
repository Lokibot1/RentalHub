import express from "express";

const router = express.Router();

// Load routes asynchronously before adding them to the router
const manageListings = await import("./manage-listings.js").then(m => m.default);
const dashboard = await import("./dashboard.js").then(m => m.default);
const myRents = await import("./my-rents.js").then(m => m.default);
const myItems = await import("./my-items.js").then(m => m.default);
const manageUsers = await import("./manage-users.js").then(m => m.default);
const archive = await import("./archive.js").then(m => m.default);
const transactions = await import("./transactions.js").then(m => m.default);
const profile = await import("./profile.js").then(m => m.default);

// Route Prefix: /api/admin
router.use("/manage-listings", manageListings);
router.use("/dashboard", dashboard);
router.use("/my-rents", myRents);
router.use("/my-items", myItems);
router.use("/archive", archive);
router.use("/manage-users", manageUsers);
router.use("/transactions", transactions);
router.use("/profile", profile);

export default router
