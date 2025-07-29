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
      this.belongsTo(models.Task, { foreignKey: "task_id" });
    }
  }
  TaskLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: DataTypes.BIGINT,
      day: DataTypes.DATE,
      duration: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "TaskLog",
      underscored: true,
    }
  );
  return TaskLog;
};
