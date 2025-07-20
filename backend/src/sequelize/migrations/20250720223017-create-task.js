'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references:  {
          model: 'users',
          key: 'id'
        }
      },
      description: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      estimate: {
        type: Sequelize.INTEGER
      },
      due_date: {
        type: Sequelize.DATE
      },
      priority: {
        type: Sequelize.ENUM('low','medium','high')
      },
      status: {
        type: Sequelize.ENUM('low','medium','high')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};