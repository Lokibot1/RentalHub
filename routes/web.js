const express = require("express");
const toTitleCase = require("../helpers/toTitleCase");
const checkAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", checkAuth, (req, res) => {
  res.render("index", {
    title: "Main",
    isAuthenticated: req.isAuthenticated,
    user: req.user
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login"
  });
});

router.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup"
  });
});

router.get("/shopping/:category", (req, res) => {
  res.render("shopping", {
    category: toTitleCase(req.params.category),
    title: toTitleCase(req.params.category),
  });
});

module.exports = router;