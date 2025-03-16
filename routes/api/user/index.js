const express = require("express");

const router = express.Router();

// Route Prefix: /api/user
router.use("/posts", require("./posts"));
router.use("/profile", require("./profile"));
router.use("/dashboard", require("./dashboard"));
router.use("/my-requests", require("./my-requests"));
router.use("/listings", require("./listings"));
router.use("/view-product", require("./view-product"));


module.exports = router;
