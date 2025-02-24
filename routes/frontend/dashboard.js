const express = require("express");
const { checkAuth } = require("../../middlewares/auth");

const router = express.Router();

router.get("/", checkAuth, (req, res) => {
  res.render("dashboard/index", {
    layout: "layouts/dashboard",
    title: "Dashboard",
    isAuthenticated: req.isAuthenticated,
  });
});


module.exports = router;