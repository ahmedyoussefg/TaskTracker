const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();

router.post("/sign-up", async (req, res) => {
  const { display_name, email, password, username } = req.body;

  if (!display_name || !email || !password || !username) {
    return res.status(400).json({ error: "Some fields are missing." });
  }

  try {
    await sequelize.models.User.create({
      display_name,
      email,
      password,
      username,
    });

    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: err.errors?.[0]?.message || "Email or username already in use.",
      });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: err.errors?.[0]?.message || "Validation error.",
      });
    }
    console.error("[ERROR] Sign-up error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
