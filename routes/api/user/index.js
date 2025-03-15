const express = require("express");

const router = express.Router();

// Route Prefix: /api/user
router.use("/posts", require("./posts"));
router.use("/profile", require("./profile"));
router.use("/dashboard", require("./dashboard"));
router.use("/rent", require("./rent"));


module.exports = router;
