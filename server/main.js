import express from "express"
import path from "node:path"
import { fileURLToPath } from 'node:url'
import cookieParser from "cookie-parser"
import expressLayouts from "express-ejs-layouts"
import morgan from "morgan"

const app = express();

app.use(morgan("tiny"));
app.use(express.json()); // Enables parsing of JSON request bodies

// Use cookie parser middleware
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.set("views", path.join(__dirname, "../app"));
app.use(expressLayouts);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../app/public/")));

// Serve static files from the "C:\uploads" directory
app.use("/uploads", express.static(process.env.STORAGE_PATH));


// Dynamically import routes using `import()`
const loadRoute = async (route) => (await import(route)).default;

// Frontend routes
app.use("/", await loadRoute("./routes/app/main.js"));
app.use("/admin", await loadRoute("./routes/app/admin.js"));
app.use("/user", await loadRoute("./routes/app/user.js"));
app.use("/auth/otp", await loadRoute("./routes/app/otp.js"));

// 403 route
app.use("/forbidden", await loadRoute("../server/routes/forbidden.js"));

// Backend routes
app.use("/api", await loadRoute("../server/routes/api/listing.js"));
app.use("/api/auth", await loadRoute("../server/routes/api/auth.js"));

// Backend Admin route
app.use("/api/admin", await loadRoute("../server/routes/api/admin/index.js"));

// Backend User route
app.use("/api/user", await loadRoute("../server/routes/api/user/index.js"));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
