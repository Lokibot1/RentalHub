const express = require("express");
const toTitleCase = require("../../helpers/toTitleCase");
const { optionalAuth } = require("../../middlewares/auth");

const router = express.Router();


/**
 * Main page
 * @route GET /
 */
router.get("/", optionalAuth, (req, res) => {
  res.render("main/index", {
    layout: "layouts/main",
    title: "Main",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Login page
 * @route GET /login
 */
router.get("/login", (req, res) => {
  res.render("main/login", {
    layout: "layouts/main",
    title: "Login",
  });
});


/**
 * Logout
 * @route GET /logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});


/**
 * Signup page
 * @route GET /signup
 */
router.get("/signup", (req, res) => {
  res.render("main/signup", {
    layout: "layouts/main",
    title: "Signup"
  });
});


/**
 * Shopping page
 * @route GET /shopping/:category
 */
router.get("/shopping/:category", (req, res) => {
  res.render("main/shopping", {
    layout: "layouts/main",
    category: toTitleCase(req.params.category),
    title: toTitleCase(req.params.category),
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});



module.exports = router;