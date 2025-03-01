const express = require("express");
const { checkAuth } = require("../../middlewares/auth");

const router = express.Router();


/**
 * Dashboard
 * @route GET /dashboard
 */
router.get("/", checkAuth, (req, res) => {
  res.render("dashboard/index", {
    layout: "layouts/dashboard",
    title: "Dashboard",
    isAuthenticated: req.isAuthenticated,
  });
});


/**
 * Dashboard
 * @route GET /listing
 */
router.get("/listing", checkAuth, (req, res) => {
  res.render("dashboard/listing", {
    layout: "layouts/dashboard",
    title: "Add New Listing",
    isAuthenticated: req.isAuthenticated,
  });
});


/**
 * Add newLisitng page
 * @route GET /user-dashboard
 */
router.get("/user-dashboard", checkAuth, (req, res) => {
  res.render("dashboard/user-dashboard", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "User Dashboard",
  });
});


/**
 * Add newLisitng page
 * @route GET /profile
 */
router.get("/profile", checkAuth, (req, res) => {
  res.render("dashboard/profile", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "User Profile",
  });
});


/**
 * Add newLisitng page
 * @route GET /rents
 */
router.get("/rents", checkAuth, (req, res) => {
  res.render("dashboard/rents", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "My Rents",
  });
});


/**
 * Add newLisitng page
 * @route GET /my-listings
 */
router.get("/my-listing", checkAuth, (req, res) => {
  res.render("dashboard/my-listing", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "My Listings",
  });
});


/**
 * Add newLisitng page
 * @route GET /archives
 */
router.get("/archives", checkAuth, (req, res) => {
  res.render("dashboard/archives", {
    layout: "layouts/main",
    /*category: toTitleCase(AddListing), */
    title:  "Archives",
  });
});


module.exports = router;