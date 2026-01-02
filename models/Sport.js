"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sport extends Model {
    static associate(models) {
      Sport.belongsTo(models.User, { foreignKey: "userId" });
      Sport.hasMany(models.Session, { foreignKey: "sportId", onDelete: 'CASCADE' });
      // onDelete: 'CASCADE' means if Sport is deleted, delete all its sessions too!
    }

    // Custom robust method
    static addSport({ title, userId }) {
      return this.create({ title, userId });
    }
    
    static getSports() {
        return this.findAll({ include: 'User' }); // Join with User table
    }
  }

  Sport.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "Sport",
    }
  );
  return Sport;
};