"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Task, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      display_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Display name is required." },
          notEmpty: { msg: "Display name cannot be empty." },
          is: {
            args: /^[a-zA-Z\s]*$/,
            msg: "Display name must contain only letters and whitespaces.",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { name: "unique_email", msg: "Email already used." },
        validate: {
          notNull: { msg: "Email is required." },
          notEmpty: { msg: "Email cannot be empty." },
          isEmail: { msg: "Invalid email address" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { name: "unique_username", msg: "Username already used." },
        validate: {
          notNull: { msg: "Username is required." },
          notEmpty: { msg: "Username cannot be empty." },
          is: {
            args: /^[\w.]+$/,
            msg: "Username must only contain alphanumerical, dot or underscore.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          // store email lowercase
          if (user.email) {
            user.email = user.email.toLowerCase();
          }
          // store username lowercase
          if (user.username) {
            user.username = user.username.toLowerCase();
          }
          if (user.password) {
            // hash password
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  return User;
};
