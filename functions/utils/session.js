const { SignJWT, jwtVerify } = require("jose");
const functions = require("firebase-functions");
const crypto = require("crypto");

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

const jwtSecret = functions.config().jwt.secret;

const key = new TextEncoder().encode(jwtSecret);

async function encrypt(payload) {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(key);
}

async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

async function getSession(req) {
  const session = req.headers["authorization"];
  console.log("Session:", session);
  if (!session) return null;
  return await decrypt(session);
}

async function updateSession(req, res, next) {
  const session = req.headers["authorization"];
  if (!session) return next();

  try {
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + SESSION_DURATION);
    const newSessionToken = await encrypt(parsed);

    res.json({ message: "Session successfully updated", token: newSessionToken });
    next();
  } catch (error) {
    console.error("Error updating session:", error);
    res.json("session");
    next();
  }
}

function generateUniqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  SESSION_DURATION,
  encrypt,
  decrypt,
  getSession,
  updateSession,
  generateUniqueToken,
};
