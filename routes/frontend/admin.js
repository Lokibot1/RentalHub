const express = require("express");
const { checkAuth, checkAdmin } = require("../../middlewares/auth");

const router = express.Router();

/**
 * Admin Page
 * @route GET /admin/dashboard
 */
router.get("/dashboard", checkAuth, checkAdmin, (req, res) => {
  res.render("admin/dashboard", {
    layout: "layouts/dashboard",
    title:  "Admin Dashboard",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Manager Users
 * @route GET /admin/manage-users
 */
router.get("/manage-users", checkAuth, checkAdmin, (req, res) => {
  res.render("admin/manage-users", {
    layout: "layouts/dashboard",
    title:  "Manage Users",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Manage Listings
 * @route GET /admin/manage-listings
 */
router.get("/manage-listings", checkAuth, checkAdmin, (req, res) => {
  res.render("admin/manage-listings", {
    layout: "layouts/dashboard",
    title:  "Manage Listings",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Transactions
 * @route GET /admin/transactions
 */
router.get("/transactions", checkAuth, checkAdmin, (req, res) => {
  res.render("admin/transactions", {
    layout: "layouts/dashboard",
    title:  "Transactions",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


module.exports = router;