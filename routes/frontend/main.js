const express = require("express");
const toTitleCase = require("../../helpers/toTitleCase");
const checkAuth = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", checkAuth, (req, res) => {
  res.render("main/index", {
    layout: "layouts/main",
    title: "Main",
  });
});

router.get("/login", (req, res) => {
  res.render("main/login", {
    layout: "layouts/main",
    title: "Login"
  });
});

router.get("/logout", (req, res) => {
  res.redirect("/login");
});

router.get("/signup", (req, res) => {
  res.render("main/signup", {
    layout: "layouts/main",
    title: "Signup"
  });
});

router.get("/shopping/:category", (req, res) => {
  res.render("main/shopping", {
    layout: "layouts/main",
    category: toTitleCase(req.params.category),
    title: toTitleCase(req.params.category),
  });
});

module.exports = router;