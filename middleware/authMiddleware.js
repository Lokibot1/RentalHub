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

module.exports = checkAuth;