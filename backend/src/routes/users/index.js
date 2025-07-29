const { Op, fn, col, where } = require("sequelize");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../env");
const { body, validationResult } = require("express-validator");

const User = sequelize.models.User;

router.post(
  "/sign-up",
  [
    body("display_name").notEmpty().withMessage("Display name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("username").notEmpty().withMessage("Username is required"),
  ],
  async (req, res) => {
    const { display_name, email, password, username } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
          error:
            err.errors?.[0]?.message || "Email or username already in use.",
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
  }
);

router.post(
  "/login",
  [
    body("identifier")
      .notEmpty()
      .withMessage("Email or username is required.")
      .isString()
      .withMessage("Identifier must be a string."),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isString()
      .withMessage("Password must be a string."),
  ],
  async (req, res) => {
    const { identifier, password } = req.body; // identifier = email or username

    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // find user where email = identifier or username = identifier
      const loggingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            where(fn("lower", col("username")), identifier.toLowerCase()),
          ],
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
        },
        env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      res
        .status(201)
        .json({ msg: "User authentication is successful.", token: token });
    } catch (err) {
      console.error("[ERROR] Login error:", err.message);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
