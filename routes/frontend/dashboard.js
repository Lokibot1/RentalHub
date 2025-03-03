const express = require("express");
const { checkAuth } = require("../../middlewares/auth");

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
  });
});


/**
 * User Dashboard
 * @route GET /dashboard/user-dashboard
 */
router.get("/user-dashboard", checkAuth, (req, res) => {
  res.render("dashboard/user-dashboard", {
    layout: "layouts/dashboard",
    title:  "User Dashboard",
  });
});


/**
 * Profile Page
 * @route GET /dashboard/profile
 */
router.get("/profile", checkAuth, (req, res) => {
  res.render("dashboard/profile", {
    layout: "layouts/dashboard",
    title:  "User Profile",
  });
});


/**
 * Rents Page
 * @route GET /dashboard/rents
 */
router.get("/rents", checkAuth, (req, res) => {
  res.render("dashboard/rents", {
    layout: "layouts/dashboard",
    title:  "My Rents",
  });
});


/**
 * My Listing Page
 * @route GET /dashboard/my-listing
 */
router.get("/my-listing", checkAuth, (req, res) => {
  res.render("dashboard/my-listing", {
    layout: "layouts/dashboard",
    title:  "My Listings",
  });
});


/**
 * Archives Page
 * @route GET /dashboard/archives
 */
router.get("/archives", checkAuth, (req, res) => {
  res.render("dashboard/archives", {
    layout: "layouts/dashboard",
    title:  "Archives",
  });
});

/**
 * View Product Page
 * @route GET /dashboard/view-product
 */
router.get("/view-product", checkAuth, (req, res) => {
  res.render("dashboard/view-product", {
    layout: "layouts/dashboard",
    title:  "View Product",
  });
});


/**
 * Setup Profile Pae
 * @route GET /dashboard/setup-profile
 */
router.get("/setup-profile", checkAuth, (req, res) => {
  // remove the otp from cookies
  res.clearCookie('otp');


  res.render("dashboard/setup-profile", {
    layout: "layouts/dashboard",
    title:  "Setup Profile",
  });
});


module.exports = router;