const admin = require("firebase-admin");

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  const sessionId = req.headers["session-id"]; // Klien harus mengirim ini juga

  if (!token || !sessionId) {
    return res.status(403).json({ message: "No token or session ID provided" });
  }

  try {
    const snapshot = await admin.database().ref("sessions").child(sessionId).once("value");
    const sessionData = snapshot.val();

    if (!sessionData || sessionData.token !== token) {
      return res.status(403).json({ message: "Invalid token or session" });
    }

    // Memeriksa apakah sesi sudah kedaluwarsa
    const expires = new Date(sessionData.expires);
    if (expires < new Date()) {
      await admin.database().ref("sessions").child(sessionId).remove();
      return res.status(403).json({ message: "Session expired" });
    }

    req.session = sessionData;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = verifyToken;
