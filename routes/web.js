const express = require("express");
const path = require("path");
const toTitleCase = require("../utils/toTitleCase");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/shopping/:category", (req, res) => {
  res.render("shopping", {
    category: req.params.category,
    title: toTitleCase(req.params.category),
  });
});

module.exports = router;