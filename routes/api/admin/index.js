const express = require("express");

const router = express.Router();

// Route Prefix: /api/admin
router.use("/posts", require("./posts"));
router.use("/dashboard", require("./dashboard"));
router.use("/manage-users", require("./manage-users"));
router.use("/transactions", require("./transactions"));


module.exports = router;
