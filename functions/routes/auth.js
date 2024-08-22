const express = require("express");
const verifyToken = require("../utils/authMiddleware");
const { validateTelegramWebAppData } = require("../utils/telegramAuth");
const { encrypt, SESSION_DURATION, generateUniqueToken } = require("../utils/session");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/", async (req, res) => {
  const { initData } = req.body;

  const validationResult = validateTelegramWebAppData(initData);

  if (validationResult.validatedData) {
    console.log("Validation result: ", validationResult);
    const user = { telegramId: validationResult.user.id };

    // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION);
    const sessionToken = await encrypt({ user, expires });

    const sessionId = generateUniqueToken();

    console.log("Session created: ", sessionId);

    try {
      await admin.database().ref("session").child(sessionId).set({
        token: sessionToken,
        user: user,
        expires: expires.toISOString(),
        createdAt: new Date().toISOString(),
      });
      // send token and sessionId to client
      res.json({ message: "Authentication successful", token: sessionToken, sessionId: sessionId });
    } catch (error) {
      console.error("Error saving session to database:", error);
      res.status(500).json({ message: "An error occurred while saving the session." });
    }
  } else {
    res.status(401).json({ message: validationResult.message });
  }
});

// Rute yang memerlukan autentikasi
router.get("/protected", verifyToken, (req, res) => {
  // req.session tersedia di sini
  res.json({ message: "This is a protected route", user: req.session.user });
});

module.exports = router;
