const express = require("express");
const { checkAuth } = require("../../middlewares/auth");

const router = express.Router();

/**
 * Admin Page
 * @route GET /admin/dashboard
 */
router.get("/dashboard", checkAuth, (req, res) => {
  res.render("admin/dashboard", {
    layout: "layouts/dashboard",
    title:  "Admin Dashboard",
  });
});


/**
 * Manager Users
 * @route GET /admin/manage-users
 */
router.get("/manage-users", checkAuth, (req, res) => {
  res.render("admin/manage-users", {
    layout: "layouts/dashboard",
    title:  "Manage Users",
  });
});


/**
 * Manage Listings
 * @route GET /admin/manage-listings
 */
router.get("/manage-listings", checkAuth, (req, res) => {
  res.render("admin/manage-listings", {
    layout: "layouts/dashboard",
    title:  "Manage Listings",
  });
});


/**
 * Transactions
 * @route GET /admin/transactions
 */
router.get("/transactions", checkAuth, (req, res) => {
  res.render("admin/transactions", {
    layout: "layouts/dashboard",
    title:  "Transactions",
  });
});


module.exports = router;