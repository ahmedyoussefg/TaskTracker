const authenticateToken = require("../../middlewares/auth");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Task = sequelize.models.Task;
const TaskLog = sequelize.models.TaskLog;

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
      include: [
        {
          model: TaskLog,
          attributes: ["day", "duration"],
          as: "taskLogs",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
          SELECT COALESCE(SUM("duration"), 0)
          FROM "tasklogs"
          WHERE "tasklogs"."task_id" = "Task"."id"
        )`),
            "totalLoggedTime",
          ],
        ],
      },
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
        user_id: req.currentUser.id,
      },
      include: [
        {
          model: TaskLog,
          attributes: ["day", "duration"],
          as: "taskLogs",
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
          SELECT COALESCE(SUM("duration"), 0)
          FROM "tasklogs"
          WHERE "tasklogs"."task_id" = "Task"."id"
        )`),
            "totalLoggedTime",
          ],
        ],
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json(task);
  } catch (err) {
    console.error("[ERROR] Get Task by ID:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete a task by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedCount = await Task.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(204).send();
  } catch (err) {
    console.error("[ERROR] Delete Task:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Update a task by ID
router.patch("/:id", authenticateToken, async (req, res) => {
  const { title, description, estimate, due_date, priority, status } = req.body;

  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Only update the provided fields
    await task.update({
      title: title ?? task.title,
      description: description ?? task.description,
      estimate: estimate ?? task.estimate,
      due_date: due_date ?? task.due_date,
      priority: priority ?? task.priority,
      status: status ?? task.status,
    });

    res.status(200).json(task);
  } catch (err) {
    console.error("[ERROR] Update Task:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Log time for a task
router.post(
  "/:id/log-time",
  authenticateToken,
  [
    body("duration")
      .isFloat({ gt: 0 })
      .withMessage("Duration must be a positive number."),
  ],
  async (req, res) => {
    const { duration, day } = req.body;
    const taskId = req.params.id;
    const date = day ? new Date(day) : new Date(); // default: today

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.findOne({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found." });
      }

      // Check if log exists for this task and date
      const [log, created] = await TaskLog.findOrCreate({
        where: {
          task_id: taskId,
          day: date,
        },
        defaults: {
          duration: duration,
        },
      });

      if (!created) {
        log.duration += duration;
        await log.save();
      }

      res.status(200).json({
        message: "Time logged successfully.",
        log,
      });
    } catch (err) {
      console.error("[ERROR] Log Time:", err.message);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
