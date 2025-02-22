const express = require("express");
const path = require("path");

const app = express();
app.use(express.json()); // Enables parsing of JSON request bodies

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public/")));

// Import routes
const webRoutes = require("./routes/web");
const apiAuthRoutes = require("./routes/api/auth");

// Frontend routes
app.use("/", webRoutes);

// Backend routes
app.use("/api/auth", apiAuthRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
