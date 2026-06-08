const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests",
});
// when behind a proxy (Render, Heroku, etc.) enable trust proxy so
// rateLimit uses the correct client IP address
app.set('trust proxy', 1);

// Apply the limiter only to API routes to avoid blocking static file
// requests and platform health checks
app.use('/api', limiter);
app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static("uploads")
);
app.use(express.static(path.join(__dirname, "../client")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/elections", require("./routes/electionRoutes"));
app.use("/api/vote", require("./routes/voteRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use(
  "/api/setup",
  require("./routes/setupAdmin")
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message || err);
    process.exit(1);
  });
