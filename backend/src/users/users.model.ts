import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/database";
import { UserModelAttributes } from "./types";
import { AccountCreationAttributes } from "../auth/types";
import { BadRequestError } from "../utils/appError";

export class Users
  extends Model<UserModelAttributes, AccountCreationAttributes>
  implements UserModelAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;

  public confirmPassword?: string;
  public countryCode!: string;
  public phoneNumber!: string;

  public emailVerified!: boolean;
  public verifyToken?: string | null;
  public resetPasswordToken?: string | null;
  public resetPasswordExpires?: Date | null;
}

Users.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },

    confirmPassword: {
      type: DataTypes.VIRTUAL,
      validate: {
        matchesPassword(this: Users) {
          if (this.password !== this.confirmPassword) {
            throw new BadRequestError("Passwords do not match");
          }
        },
      },
    },

    countryCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: { is: /^\+\d{1,4}$/ },
    },

    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: { msg: "Phone number must contain only digits" },
        len: { args: [6, 20], msg: "Phone number must be 6–20 digits" },
      },
    },

    // 🔥 Email verification
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifyToken: { type: DataTypes.STRING, allowNull: true },

    // 🔥 Password reset
    resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
    resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "User", tableName: "users" }
);
