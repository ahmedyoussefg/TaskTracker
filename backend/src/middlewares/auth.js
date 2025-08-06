const jwt = require("jsonwebtoken");
const env = require("../env");
const { sequelize } = require("../sequelize/models");
const { logger } = require("../logger");

const User = sequelize.models.User;

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token missing." });
  }
  try {
    const payload = jwt.verify(token, env.JWT_KEY);
    const currentUser = await User.findByPk(payload.id);
    if (!currentUser) {
      return res.status(401).json({ error: "Invalid user token." });
    }
    req.currentUser = currentUser;
    next();
  } catch (err) {
    logger.error("JWT verification failed", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = authenticateToken;
