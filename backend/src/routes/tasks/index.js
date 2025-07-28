const authenticateToken = require("../../middlewares/auth");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();

const Task = sequelize.models.Task;

// Create Task
router.post("/", authenticateToken, async (req, res) => {
  const { title, description, estimate, due_date, priority, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    const task = await Task.create({
      user_id: req.currentUser.id,
      title: title,
      description:description,
      estimate:estimate,
      due_date:due_date,
      priority:priority,
      status:status,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("[ERROR] Create Task:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

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

module.exports = router;
