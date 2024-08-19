const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/session");
require("dotenv").config();

const app = express();

// Konfigurasi CORS
const corsOptions = {
  // origin: "http://localhost:3001", // should be match to FE origin
  origin: "*", // allow all origins
  credentials: true, // this is important to allow session cookies
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
