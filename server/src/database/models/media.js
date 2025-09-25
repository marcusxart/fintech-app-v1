"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    static associate(models) {}
  }

  Media.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Media",
      tableName: "Media",
      timestamps: true,
    }
  );

  return Media;
};
