const authenticateToken = require("../../middlewares/auth");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Task = sequelize.models.Task;

// Create Task
router.post(
  "/",
  authenticateToken,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required.")
      .isString()
      .withMessage("Title must be a string."),
  ],
  async (req, res) => {
    const { title, description, estimate, due_date, priority, status } =
      req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.create({
        user_id: req.currentUser.id,
        title: title,
        description: description,
        estimate: estimate,
        due_date: due_date,
        priority: priority,
        status: status,
      });

      res.status(201).json(task);
    } catch (err) {
      console.error("[ERROR] Create Task:", err.message);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// Get all tasks of the user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { user_id: req.currentUser.id },
    });
    res.json(tasks);
  } catch (err) {
    console.error("[ERROR] Get Tasks:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get a specific task by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(task);
  } catch (err) {
    console.error("[ERROR] Get Task by ID:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;
