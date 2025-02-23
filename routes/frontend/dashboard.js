const express = require("express");
const { checkAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", checkAuth, (req, res) => {
  res.render("dashboard/index", {
    layout: "layouts/dashboard",
    title: "Dashboard",
    isAuthenticated: req.isAuthenticated,
  });
});


module.exports = router;