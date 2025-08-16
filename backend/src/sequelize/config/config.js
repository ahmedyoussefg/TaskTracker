const env = require("../../env");
const { logger } = require("../../logger");

module.exports = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
  },
  test: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
  },
};
