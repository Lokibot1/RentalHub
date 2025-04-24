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


/**
 * Terms and Condition Page
 * @route GET /terms-and-condition
 */
router.get("/terms-and-condition", (req, res) => {
  res.render("main/terms-and-condition", {
    layout: "layouts/main",
    title: "Terms and Condition",
  });
});


/**
 * Privacy Policy Page
 * @route GET /privacy-policy
 */
router.get("/privacy-policy", (req, res) => {
  res.render("main/privacy-policy", {
    layout: "layouts/main",
    title: "Privacy Policy",
  });
});


/**
 * Meet My Team Page
 * @route GET /meet-my-team
 */
router.get("/meet-the-team", (req, res) => {
  res.render("main/meet-the-team", {
    layout: "layouts/main",
    title: "Meet My Team",
  });
});

export default router