const env = require("../../env");

module.exports = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
  },
  test: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
  },
};
