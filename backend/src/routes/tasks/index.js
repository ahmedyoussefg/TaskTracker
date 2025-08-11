const authenticateToken = require("../../middlewares/auth");
const { sequelize } = require("../../sequelize/models");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { logger } = require("../../logger");

const Task = sequelize.models.Task;
const TaskLog = sequelize.models.TaskLog;

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Create a new task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               estimate:
 *                 type: number
 *                 format: float
 *                 description: Estimated time to complete task
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority level
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 description: Task status
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *                 user_id:
 *                   type: integer
 *                   format: int64
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 estimate:
 *                   type: number
 *                   format: float
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                 priority:
 *                   type: string
 *                   enum: [low, medium, high]
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
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
      logger.error("Create Task error", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks
 *     description: Retrieve all tasks belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     format: int64
 *                   user_id:
 *                     type: integer
 *                     format: int64
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   estimate:
 *                     type: number
 *                     format: float
 *                   due_date:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high]
 *                   status:
 *                     type: string
 *                     enum: [todo, in_progress, done]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   totalLoggedTime:
 *                     type: number
 *                     format: float
 *                     description: Total time logged for this task
 *                   taskLogs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                           format: date
 *                         duration:
 *                           type: number
 *                           format: float
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
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
    logger.error("Create Task error", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a specific task by ID
 *     description: Retrieve a specific task belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *                 user_id:
 *                   type: integer
 *                   format: int64
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 estimate:
 *                   type: number
 *                   format: float
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                 priority:
 *                   type: string
 *                   enum: [low, medium, high]
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 totalLoggedTime:
 *                   type: number
 *                   format: float
 *                   description: Total time logged for this task
 *                 taskLogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         format: date
 *                       duration:
 *                         type: number
 *                         format: float
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Task not found
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
    logger.error("Get Task By ID error", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task by ID
 *     description: Delete a specific task belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to delete
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       204:
 *         description: Task deleted successfully (no content)
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Task not found
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
    logger.error("Delete Task error", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task by ID
 *     description: Update specific fields of a task belonging to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to update
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               estimate:
 *                 type: number
 *                 format: float
 *                 description: Estimated time to complete task
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority level
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 description: Task status
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   format: int64
 *                 user_id:
 *                   type: integer
 *                   format: int64
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 estimate:
 *                   type: number
 *                   format: float
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                 priority:
 *                   type: string
 *                   enum: [low, medium, high]
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Task not found
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
    logger.error("Update Task error", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @openapi
 * /api/tasks/{id}/log-time:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Log time for a task
 *     description: Log time spent on a specific task for a given day
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to log time for
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *             properties:
 *               duration:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 description: Time duration in hours (must be positive)
 *               day:
 *                 type: string
 *                 format: date
 *                 description: Date to log time for (defaults to today if not provided)
 *     responses:
 *       200:
 *         description: Time logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 log:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       format: int64
 *                     task_id:
 *                       type: integer
 *                       format: int64
 *                     day:
 *                       type: string
 *                       format: date
 *                     duration:
 *                       type: number
 *                       format: float
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
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
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Task not found
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
      logger.error("Log Time error", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
