const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const token = req.cookies.token || '';

  if (!token) {
    req.isAuthenticated = false;
    return res.redirect("/login");
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.role = req.user.role;
    req.isAuthenticated = true;
  } catch (err) {
    req.isAuthenticated = false;
    req.role = null;
    return res.redirect("/login");
  }

  next();
}

function checkAdmin(req, res, next) {
  if (!req.isAuthenticated || req.user.role !== 'admin') {
    return res.redirect("/forbidden");
  }
  next();
}

function checkUser(req, res, next) {
  if (!req.isAuthenticated || req.user.role !== 'user') {
    return res.redirect("/forbidden");
  }
  next();
}

function optionalAuth(req, res, next) {
  const token = req.cookies.token || '';

  if (!token) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.role = req.user.role;
    req.isAuthenticated = true;
  } catch (err) {
    req.role = null;
    req.isAuthenticated = false;
  }

  next();
}

module.exports = {
  checkAuth,
  checkAdmin,
  checkUser,
  optionalAuth
};