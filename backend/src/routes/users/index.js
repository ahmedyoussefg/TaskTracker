const { Op } = require("sequelize");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../env");

const User = sequelize.models.User;

router.post("/sign-up", async (req, res) => {
  const { display_name, email, password, username } = req.body;

  if (!display_name || !email || !password || !username) {
    return res.status(400).json({ error: "Some fields are missing." });
  }

  try {
    await User.create({
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

    console.error("[ERROR] Sign up error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier = email or username

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: "Email/Username and password are required." });
  }

  try {
    // find user where email = identifier or username = identifier
    const loggingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!loggingUser) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, loggingUser.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign(
      {
        id: loggingUser.id,
        email: loggingUser.email,
        username: loggingUser.username,
      },
      env.JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
    res
      .status(200)
      .json({ msg: "User authentication is successful.", token: token });
  } catch (err) {
    console.error("[ERROR] Login error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
