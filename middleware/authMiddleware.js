const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const token = req.cookies.token || '';

  if (!token) {
    req.isAuthenticated = false;
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.isAuthenticated = true;
  } catch (err) {
    req.isAuthenticated = false;
    return res.redirect("/login");
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.isAuthenticated = true;
  } catch (err) {
    req.isAuthenticated = false;
  }

  next();
}

module.exports = {
  checkAuth,
  optionalAuth
};