const request = require("supertest");
const express = require("express");
const taskRoutes = require("../routes/tasks");

jest.mock("../sequelize/models", () => ({
  sequelize: {
    models: {
      Task: {
        create: jest.fn(),
        findOne: jest.fn(),
        destroy: jest.fn(),
      },
      TaskLog: {
        findOrCreate: jest.fn(),
      },
    },
    literal: jest.fn(() => "mocked_literal"),
  },
}));

jest.mock("../middlewares/auth", () => (req, res, next) => {
  req.currentUser = { id: 1 };
  next();
});

const { sequelize } = require("../sequelize/models");
const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

describe("Task Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a task for authenticated user", async () => {
    sequelize.models.Task.create.mockResolvedValue({
      id: 1,
      user_id: 1,
      title: "Test Task",
    });

    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Test Task" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "Test Task");
    expect(sequelize.models.Task.create).toHaveBeenCalledWith({
      user_id: 1,
      title: "Test Task",
      description: undefined,
      estimate: undefined,
      due_date: undefined,
      priority: undefined,
      status: undefined,
    });
  });

  it("should return 400 if title is missing", async () => {
    const res = await request(app).post("/api/tasks").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Title is required.");
  });

  it("should return 404 if task not found", async () => {
    sequelize.models.Task.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/tasks/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Task not found." });
  });

  it("should log time for a task", async () => {
    sequelize.models.Task.findOne.mockResolvedValue({ id: 1 });
    sequelize.models.TaskLog.findOrCreate.mockResolvedValue([
      { duration: 30, save: jest.fn() },
      true, // created
    ]);

    const res = await request(app).post("/api/tasks/1/log-time").send({
      duration: 30,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Time logged successfully.");
    expect(sequelize.models.Task.findOne).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });

  it("should delete task successfully", async () => {
    sequelize.models.Task.destroy.mockResolvedValue(1); // 1 row deleted

    const res = await request(app).delete("/api/tasks/1");

    expect(res.statusCode).toBe(204);
    expect(sequelize.models.Task.destroy).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});
