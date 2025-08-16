const { Op, fn, col, where } = require("sequelize");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../env");
const { body, validationResult } = require("express-validator");
const { logger } = require("../../logger");

const User = sequelize.models.User;
/**
 * @openapi
 * /api/users/sign-up:
 *   post:
 *     tags:
 *       - Users
 *     summary: Sign up a new user
 *     description: Endpoint to register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - display_name
 *               - email
 *               - password
 *               - username
 *             properties:
 *               display_name:
 *                 type: string
 *                 description: User's display name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               username:
 *                 type: string
 *                 description: Unique username
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       409:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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
      const newUser = await User.create({
        display_name,
        email,
        password,
        username,
      });

      const token = jwt.sign({ id: newUser.id }, env.JWT_KEY, {
        expiresIn: "1h",
      });

      res.status(201).json({
        message: "User created successfully.",
        token,
      });
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

      logger.error("Sign up error", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: User login
 *     description: Authenticate user with email/username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       201:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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
      logger.error("Login error", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
