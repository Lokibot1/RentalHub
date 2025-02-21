const express = require("express");
const { dbConnect } = require("./utils/db"); // Import the connect function
const path = require("path");

const app = express();
app.use(express.json()); // Enables parsing of JSON request bodies

// Connect to MySQL database
// dbConnect();

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
