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
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "User Dashboard",
  });
});


/**
 * Profile Page
 * @route GET /dashboard/profile
 */
router.get("/profile", checkAuth, (req, res) => {
  res.render("dashboard/profile", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "User Profile",
  });
});


/**
 * Rents Page
 * @route GET /dashboard/rents
 */
router.get("/rents", checkAuth, (req, res) => {
  res.render("dashboard/rents", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "My Rents",
  });
});


/**
 * My Listing Page
 * @route GET /dashboard/my-listing
 */
router.get("/my-listing", checkAuth, (req, res) => {
  res.render("dashboard/my-listing", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "My Listings",
  });
});


/**
 * Archives Page
 * @route GET /dashboard/archives
 */
router.get("/archives", checkAuth, (req, res) => {
  res.render("dashboard/archives", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "Archives",
  });
});


module.exports = router;