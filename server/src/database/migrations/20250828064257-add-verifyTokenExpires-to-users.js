"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table.verifyTokenExpires) {
      await queryInterface.addColumn("Users", "verifyTokenExpires", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (table.verifyTokenExpires) {
      await queryInterface.removeColumn("Users", "verifyTokenExpires");
    }
  },
};
