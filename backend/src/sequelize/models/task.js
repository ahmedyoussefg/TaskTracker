"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "user_id" });
      this.hasOne(models.TaskLog, { foreignKey: "task_id" });
    }
  }
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required." },
          isInt: { msg: "User ID must be an integer." },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required." },
          notEmpty: { msg: "Title cannot be empty." },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estimate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Estimate must be an integer." },
        },
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Due date must be a valid date." },
        },
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: false,
        validate: {
          notNull: { msg: "Priority is required." },
          isIn: {
            args: [["low", "medium", "high"]],
            msg: "Priority must be one of: low, medium, high.",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("todo", "in_progress", "done"),
        allowNull: false,
        validate: {
          notNull: { msg: "Status is required." },
          isIn: {
            args: [["todo", "in_progress", "done"]],
            msg: "Status must be one of: todo, in_progress, done.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Task",
      underscored: true,
    }
  );
  return Task;
};
