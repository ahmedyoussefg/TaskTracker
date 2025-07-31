"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasklogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      task_id: {
        type: Sequelize.BIGINT,
        references: {
          model: "tasks",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      day: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      duration: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tasklogs");
  },
};
