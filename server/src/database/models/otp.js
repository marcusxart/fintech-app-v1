// models/otp.model.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    static associate(models) {
      // Each OTP belongs to a User
      Otp.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
    }
  }

  Otp.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["verify-number", "verify-email", "change-password"]],
        },
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Otp",
      tableName: "Otps",
      timestamps: true,
    }
  );

  return Otp;
};
