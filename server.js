const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const app = express();

app.use(morgan("tiny"));
app.use(express.json()); // Enables parsing of JSON request bodies

// Use cookie parser middleware
app.use(cookieParser());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public/")));

// Serve static files from the "C:\uploads" directory
app.use("/uploads", express.static(process.env.STORAGE_PATH));

// Import routes
const mainRoutes = require("./routes/frontend/main");
const adminRoutes = require("./routes/frontend/admin");
const dashboardRoutes = require("./routes/frontend/dashboard");
const apiAuthRoutes = require("./routes/api/auth");
const apiListingRoute = require("./routes/api/listing");
const apiAdminPostsRoute = require("./routes/api/admin/posts");
const apiAdminDashboardRoute = require("./routes/api/admin/dashboard");
const apiUserPostsRoute = require("./routes/api/user/posts");
const otpRoute = require("./routes/frontend/otp");
const forbiddenRoute = require("./routes/forbidden");

// Frontend routes
app.use("/", mainRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/auth/otp", otpRoute);

// 403 route
app.use("/forbidden", forbiddenRoute);

// Backend routes
app.use("/api", apiListingRoute);
app.use("/api/auth", apiAuthRoutes);
app.use("/api/admin/posts", apiAdminPostsRoute);
app.use("/api/admin/dashboard", apiAdminDashboardRoute);
app.use("/api/user/posts", apiUserPostsRoute);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
