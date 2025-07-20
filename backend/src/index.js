const express = require('express');
const dotenv = require('dotenv');

const { sequelize } = require('./sequelize/models');

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const connectDB = async() => {
  console.log("[INFO] Checking database connection...");
  try {
    await sequelize.authenticate();
    console.log("[INFO] Database connection established.");
  } catch(e) {
    console.log("[ERROR] Database connection failed: ", e);
    process.exit(1);
  }
}

(async () => {

  await connectDB();
  console.log(`[INFO] Attempting to run the server on port ${PORT}...`);
  app.listen(PORT, () => {
      console.log(`[INFO] Server is running on port ${PORT}`);
  });

})();