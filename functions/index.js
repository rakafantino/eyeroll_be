const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/session");
require("dotenv").config();

// Initialize Firebase admin SDK
admin.initializeApp();

// Get a reference to the database service
const db = admin.database();

const app = express();

const corsOptions = {
  origin: ["https://staging-dragoneyes.vercel.app", "http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/protected", authRoutes);
app.use("/api/session", sessionRoutes);

exports.api = functions.https.onRequest(app);
