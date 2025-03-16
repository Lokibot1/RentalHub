const express = require("express");

const router = express.Router();

// Route Prefix: /api/user
router.use("/posts", require("./posts"));
router.use("/dashboard", require("./dashboard"));
router.use("/transactions", require("./transactions"));


module.exports = router;
