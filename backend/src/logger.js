const winston = require("winston");
const expressWinston = require("express-winston");
const morgan = require("morgan");

const requestLogger = morgan("dev");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === "production",
    }),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
});

const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  level: "error",
});

module.exports = {
  logger,
  errorLogger,
  requestLogger,
};
