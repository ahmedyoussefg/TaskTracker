'use strict';
const {
  Model
} = require('sequelize');
const { Sequelize } = require('.');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{foreignKey: 'user_id'});
    }
  }
  Task.init({
    id: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id : DataTypes.INTEGER,
    description: DataTypes.STRING,
    title: DataTypes.STRING,
    estimate: DataTypes.INTEGER,
    due_date: DataTypes.DATE,
    priority: DataTypes.ENUM('low','medium','high'),
    status: DataTypes.ENUM('todo','in_progress','done')
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};