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

module.exports = router;