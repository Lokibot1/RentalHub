import express from "express"
import toTitleCase from "../../helpers/toTitleCase.js"
import { optionalAuth } from "../../middlewares/auth.js"

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
 *
 * @route GET /shop
 */
router.get("/shop", optionalAuth, (req, res) => {
  res.render("main/shopping", {
    layout: "layouts/main",
    title: 'Shop',
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});

/**
 * Reset Password Page
 * @route GET /reset-password
 */
router.get("/reset-password", optionalAuth, (req, res) => {
  res.render("main/reset-password", {
    layout: "layouts/main",
    title: "Reset Password",
  });
});

export default router