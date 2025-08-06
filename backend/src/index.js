const express = require("express");
const env = require("./env");
const users = require("./routes/users");
const tasks = require("./routes/tasks");
const cors = require("cors");
const { logger, errorLogger, requestLogger } = require("./logger");

const { sequelize } = require("./sequelize/models");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

app.use("/api/users", users);
app.use("/api/tasks", tasks);

app.use(errorLogger);

const PORT = env.PORT || 3000;

const connectDB = async () => {
  logger.info("Checking database connection...");
  try {
    await sequelize.authenticate();
    logger.info("Database connection established.");
  } catch (e) {
    logger.error("Database connection failed:", {
      message: e.message,
      stack: e.stack,
    });
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  logger.info(`Attempting to run the server on port ${PORT}...`);
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
})();
