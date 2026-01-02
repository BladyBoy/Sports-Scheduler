"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Sport, { foreignKey: "userId" });
      User.hasMany(models.Session, { foreignKey: "userId" });
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false, // Validation: Cannot be empty
        validate: {
          notEmpty: { msg: "First name is required" }
        }
      },
      lastName: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Validation: No duplicate emails
        validate: {
          isEmail: { msg: "Must be a valid email address" }
        }
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "player" // Default role
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};