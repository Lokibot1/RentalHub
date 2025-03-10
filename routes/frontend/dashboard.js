const express = require("express");
const { checkAuth, checkUser, optionalAuth } = require("../../middlewares/auth");

const router = express.Router();


/**
 * Dashboard
 * @route GET /dashboard/listing
 */
router.get("/listing", checkAuth, (req, res) => {
  res.render("dashboard/listing", {
    layout: "layouts/dashboard",
    title: "Add New Listing",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * User Dashboard
 * @route GET /dashboard/user-dashboard
 */
router.get("/user-dashboard", checkAuth, checkUser, (req, res) => {
  res.render("dashboard/user-dashboard", {
    layout: "layouts/dashboard",
    title:  "User Dashboard",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Profile Page
 * @route GET /dashboard/profile
 */
router.get("/profile", checkAuth, checkUser, (req, res) => {
  res.render("dashboard/profile", {
    layout: "layouts/dashboard",
    title:  "User Profile",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Rents Page
 * @route GET /dashboard/rents
 */
router.get("/rents", checkAuth, checkUser, (req, res) => {
  res.render("dashboard/rents", {
    layout: "layouts/dashboard",
    title:  "My Rents",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * My Listing Page
 * @route GET /dashboard/my-listing
 */
router.get("/my-listing", checkAuth, checkUser, (req, res) => {
  res.render("dashboard/my-listing", {
    layout: "layouts/dashboard",
    title:  "My Listings",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Archives Page
 * @route GET /dashboard/archives
 */
router.get("/archives", checkAuth, checkUser, (req, res) => {
  res.render("dashboard/archives", {
    layout: "layouts/dashboard",
    title:  "Archives",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});

/**
 * View Product Page
 * @route GET /dashboard/view-product
 */
router.get("/view-product", optionalAuth, (req, res) => {
  res.render("dashboard/view-product", {
    layout: "layouts/dashboard",
    title:  "View Product",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});

/**
 * View Product Page
 * @route GET /dashboard/view-pending
 */
router.get("/view-pending", optionalAuth, (req, res) => {
  res.render("dashboard/view-pending", {
    layout: "layouts/dashboard",
    title:  "View Pending",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * View Product Page
 * @route GET /dashboard/update-listing
 */
router.get("/update-listing", optionalAuth, (req, res) => {
  res.render("dashboard/update-listing", {
    layout: "layouts/dashboard",
    title:  "Update Listing",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Setup Profile Page
 * @route GET /dashboard/setup-profile
 */
router.get("/setup-profile", checkAuth, (req, res) => {
  // remove the otp from cookies
  res.clearCookie('otp');

  res.render("dashboard/setup-profile", {
    layout: "layouts/dashboard",
    title:  "Setup Profile",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});




module.exports = router;