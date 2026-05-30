const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static("uploads")
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/elections",require("./routes/electionRoutes"));

app.use("/api/vote",require("./routes/voteRoutes"));
app.use( "/api/admin",require("./routes/adminRoutes"));
app.use(
  "/api/setup",
  require("./routes/setupAdmin")
);

app.get("/", (req, res) => {res.send("VoteSecure API Running");});

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
  const rateLimit =
require("express-rate-limit");

const limiter =
rateLimit({

  windowMs:
  15 * 60 * 1000,

  max:100,

  message:
  "Too many requests",
});

app.use(limiter);