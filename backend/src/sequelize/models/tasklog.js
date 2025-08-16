"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TaskLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Task, { foreignKey: "task_id", as:"task" });
    }
  }
  TaskLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      day: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          notNull: { msg: "Day is required" },
        },
      },
      duration: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          notNull: { msg: "Duration is required" },
        },
      },
    },
    {
      sequelize,
      tableName: "tasklogs",
      modelName: "TaskLog",
      underscored: true,
    }
  );
  return TaskLog;
};
