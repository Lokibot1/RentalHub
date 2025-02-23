const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");

const app = express();
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

// Import routes
const mainRoutes = require("./routes/frontend/main");
const dashboardRoutes = require("./routes/frontend/dashboard");
const apiAuthRoutes = require("./routes/api/auth");

// Frontend routes
app.use("/", mainRoutes);
app.use("/dashboard", dashboardRoutes);

// Backend routes
app.use("/api/auth", apiAuthRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
