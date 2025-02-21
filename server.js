const express = require("express");
const cors = require("cors");
const { dbConnect } = require("./utils/db-connection"); // Import the connect function
const path = require("path");

const app = express();
app.use(express.json()); // Enables parsing of JSON request bodies
app.use(cors()); // Allows cross-origin requests

// Connect to MySQL database
dbConnect();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public/")));

// Import routes
const webRoutes = require("./routes/web");
const authRoutes = require("./routes/backend/auth");

// Frontend routes
app.use("/", webRoutes);

// Backend routes
app.use("/api", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
