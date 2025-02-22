const express = require("express");
const path = require("path");
const toTitleCase = require("../utils/toTitleCase");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Main"
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