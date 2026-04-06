const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

const buildPath = path.join(__dirname, "../frontend/build");
const indexHtml = path.join(buildPath, "index.html");

// Dev: API only on this port; React runs on :3000 with CRA proxy → reCAPTCHA works on localhost:3000.
// Production: set SERVE_FRONTEND=1 after `npm run build` to serve the SPA from Express too.
const serveFrontend = process.env.SERVE_FRONTEND === "1";

if (serveFrontend && fs.existsSync(indexHtml)) {
  app.use(express.static(buildPath));
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.sendFile(indexHtml);
  });
} else if (serveFrontend) {
  console.warn(
    "SERVE_FRONTEND=1 but frontend/build/index.html missing — run: npm run build --prefix frontend"
  );
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API on port ${PORT} 🚀`);
  if (serveFrontend && fs.existsSync(indexHtml)) {
    console.log(`Open http://127.0.0.1:${PORT} (SPA + API)`);
  } else {
    console.log(`Use React dev server on port 3000 (proxy to this API) — npm run dev from login folder`);
  }
});