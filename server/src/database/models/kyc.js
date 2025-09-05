"use strict";
const { Model } = require("sequelize");

const { DOCUMENT_TYPES, STATUS_TYPES } = require("../../utils/variables");

module.exports = (sequelize, DataTypes) => {
  class Kyc extends Model {
    static associate(models) {
      Kyc.belongsTo(models.Users, { foreignKey: "userId", as: "user" });
    }
  }

  Kyc.init(
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
      documentType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [DOCUMENT_TYPES],
          },
        },
      },
      documentNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentImageUrl: {
        type: DataTypes.STRING, // S3, Cloudinary, etc.
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        allowNull: false,
        validate: {
          isIn: {
            args: [STATUS_TYPES],
          },
        },
      },
      rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Kyc",
    }
  );

  return Kyc;
};
