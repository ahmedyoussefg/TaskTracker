const env = require('../../env');

console.log(env);
module.exports = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: 'postgres',
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    url: "127.0.0.1",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    url: env.DB_URL,
    dialect: 'postgres',
  }
};
