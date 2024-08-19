const express = require("express");
const { validateTelegramWebAppData } = require("../utils/telegramAuth");
const { encrypt, SESSION_DURATION } = require("../utils/session");

const router = express.Router();

router.post("/", async (req, res) => {
  const { initData } = req.body;

  const validationResult = validateTelegramWebAppData(initData);

  if (validationResult.validatedData) {
    console.log("Validation result: ", validationResult);
    const user = { telegramId: validationResult.user.id };

    // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    res.cookie("session", session, { expires, httpOnly: true });

    res.json({ message: "Authentication successful" });
  } else {
    res.status(401).json({ message: validationResult.message });
  }
});

module.exports = router;
