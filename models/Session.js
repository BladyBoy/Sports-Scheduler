"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.Sport, { foreignKey: "sportId" });
      Session.belongsTo(models.User, { foreignKey: "userId" });
      
      // Connecting to our new PlayerSession model
      Session.hasMany(models.PlayerSession, { foreignKey: "sessionId", onDelete: 'CASCADE' });
    }

    //  DATABASE QUERIES  

    static async getUpcoming(sportId) {
      const now = new Date();
      return this.findAll({
        where: {
          sportId,
          date: { [Op.gte]: now } 
        },
        order: [['date', 'ASC'], ['time', 'ASC']]
      });
    }

    static async getPast(sportId) {
      const now = new Date();
      return this.findAll({
        where: {
          sportId,
          date: { [Op.lt]: now } 
        },
        order: [['date', 'DESC']]
      });
    }
  }

  Session.init(
    {
      sessionName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      playersNeeded: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 } // Cannot have negative players
      },
      canceled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      message: { // Reason for cancellation
        type: DataTypes.STRING,
        allowNull: true
      },
      sportId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: { // The Creator/Organizer
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "Session",
    }
  );
  return Session;
};