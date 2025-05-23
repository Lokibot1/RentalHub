import express from "express"
import {optionalAuth} from "../../middlewares/auth.js"
import {db} from "../../configs/db.js"
import { warmUpMailer } from "../../helpers/warmup-email.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
  // ✅ Warm up mailer in background (non-blocking)
  warmUpMailer().catch(console.error); // Warm up the mailer

  // ✅ Immediately render page
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
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const deleteSql = "DELETE FROM refresh_tokens WHERE token = ?";
    db.query(deleteSql, [refreshToken], () => {
      // Ignore error for now
    });
  }

  // Clear cookies
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.redirect("/login");
});

router.post("/refresh", (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const sql = "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?";
  db.query(sql, [oldRefreshToken], (err, results) => {
    if (err || results.length === 0) {
      // Delete token if found (just in case)
      const deleteSql = "DELETE FROM refresh_tokens WHERE token = ?";
      db.query(deleteSql, [oldRefreshToken], () => {
        return res.status(403).json({ message: "Invalid refresh token" });
      });
      return;
    }

    const tokenData = results[0];

    if (new Date(tokenData.expires_at) < new Date()) {
      const deleteSql = "DELETE FROM refresh_tokens WHERE token = ?";
      db.query(deleteSql, [oldRefreshToken], () => {
        return res.status(403).json({ message: "Refresh token expired" });
      });
      return;
    }

    const getUserSql = `
      SELECT users.id, email, roles.name AS role
      FROM users
      INNER JOIN roles ON users.role_id = roles.id
      WHERE users.id = ?
    `;
    db.query(getUserSql, [tokenData.user_id], (err, userResults) => {
      if (err || userResults.length === 0) {
        const deleteSql = "DELETE FROM refresh_tokens WHERE token = ?";
        db.query(deleteSql, [oldRefreshToken], () => {
          return res.status(403).json({ message: "User not found" });
        });
        return;
      }

      const user = userResults[0];

      const newAccessToken = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      }, process.env.JWT_SECRET, { expiresIn: "1d" }); // 1 day

      const newRefreshToken = crypto.randomBytes(64).toString("hex");
      const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

      const updateTokenSql = "UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE user_id = ?";
      db.query(updateTokenSql, [newRefreshToken, newExpiry, user.id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update refresh token" });

        res.cookie("token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        res.json({ token: newAccessToken });
      });
    });
  });
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


router.get('/shop', optionalAuth, (req, res) => {
  // If user is logged in, get status
  if (req.user) {
    const userId = req.user.id;
    const sql = "SELECT status FROM users WHERE id = ?";

    db.query(sql, [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).send("Error fetching user status.");
      }

      const userStatus = results[0].status;

      res.render("main/shopping", {
        layout: 'layouts/main',
        title: 'Shop',
        isAuthenticated: req.isAuthenticated,
        role: req.role,
        userStatus
      });
    });
  } else {
    // Guest user, no DB query needed
    res.render("main/shopping", {
      layout: 'layouts/main',
      title: 'Shop',
      isAuthenticated: false,
      role: null,
      userStatus: null
    });
  }
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