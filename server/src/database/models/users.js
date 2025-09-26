"use strict";
const { Model } = require("sequelize");
const { USER_LEVELS } = require("../../utils/variables");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // define association here
      Users.hasMany(models.Otp, { foreignKey: "userId", as: "otps" });
      Users.hasOne(models.Kyc, { foreignKey: "userId", as: "kyc" });
      Users.hasOne(models.Address, { foreignKey: "userId", as: "address" });
      Users.hasOne(models.Settings, { foreignKey: "userId", as: "settings" });

      Users.belongsTo(models.Media, {
        foreignKey: {
          name: "profileImageId",
          allowNull: true,
        },
        as: "profileImage",
        constraints: false,
      });
    }
  }
  Users.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isIn: {
            args: [USER_LEVELS],
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      profileImageId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
