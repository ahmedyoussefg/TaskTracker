const { cleanEnv, str, port, url } = require("envalid");

require("dotenv").config();

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  // Database
  DB_HOST: str({ default: "localhost" }),
  DB_URL: url({
    default: "postgresql://postgres:admin@127.0.0.1:5432/task_tracker",
  }),
  DB_PORT: port({ default: 5432 }),
  DB_NAME: str({ default: "task_tracker" }),
  DB_USER: str({ default: "postgres" }),
  DB_PASSWORD: str({ default: "admin" }),
  JWT_KEY: str(),
});

module.exports = env;
