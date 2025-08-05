const request = require("supertest");
const express = require("express");
const userRoutes = require("../routes/users");

jest.mock("../sequelize/models", () => ({
  sequelize: {
    models: {
      User: {
        create: jest.fn(),
        findOne: jest.fn(),
      },
    },
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-jwt-token"),
}));

const { sequelize } = require("../sequelize/models");
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user and return a token", async () => {
    sequelize.models.User.create.mockResolvedValue({ id: 1 });

    const res = await request(app).post("/api/users/sign-up").send({
      display_name: "Ahmed",
      email: "ahmed@example.com",
      password: "password123",
      username: "ahmed123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token", "mocked-jwt-token");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/users/sign-up").send({
      email: "missing@example.com",
      password: "pass123",
      username: "user123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe("Display name is required");
  });

  it("should return 401 if user not found during login", async () => {
    sequelize.models.User.findOne.mockResolvedValue(null);

    const res = await request(app).post("/api/users/login").send({
      identifier: "notfound@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials." });
  });
});
