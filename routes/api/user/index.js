const express = require("express");

const router = express.Router();

const apiUserDashboardRoute = require("./dashboard");
const apiUserPostsRoute = require("./posts");
const apiUserProfileRoute = require("./profile");
const apiUserRentRoute = require("./rent");

// Route Prefix: /api/user
router.use("/posts", apiUserPostsRoute);
router.use("/profile", apiUserProfileRoute);
router.use("/dashboard", apiUserDashboardRoute);
router.use("/rent", apiUserRentRoute);


module.exports = router;
