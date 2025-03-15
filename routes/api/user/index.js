const express = require("express");

const router = express.Router();

const apiUserDashboardRoute = require("./dashboard");
const apiUserPostsRoute = require("./posts");
const apiUserProfileRoute = require("./profile");

router.use("/posts", apiUserPostsRoute);
router.use("/profile", apiUserProfileRoute);
router.use("/dashboard", apiUserDashboardRoute);


module.exports = router;
