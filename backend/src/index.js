const express = require("express");
const env = require("./env");
const users = require("./routes/users");

const { sequelize } = require("./sequelize/models");

const app = express();
app.use(express.json());

app.use("/api/users", users);
const PORT = env.PORT || 3000;

const connectDB = async () => {
  console.log("[INFO] Checking database connection...");
  try {
    await sequelize.authenticate();
    console.log("[INFO] Database connection established.");
  } catch (e) {
    console.log("[ERROR] Database connection failed: ", e);
    process.exit(1);
  }
};

(async () => {
  await connectDB();
  console.log(`[INFO] Attempting to run the server on port ${PORT}...`);
  app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port ${PORT}`);
  });
})();
