"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PlayerSession extends Model {
    static associate(models) {
      PlayerSession.belongsTo(models.User, { foreignKey: "userId" });
      PlayerSession.belongsTo(models.Session, { foreignKey: "sessionId" });
    }

    static async addPlayer(sessionId, userId, playerName) {
      return this.create({ 
        sessionId, 
        userId, 
        playerName 
      });
    }
  }

  PlayerSession.init(
    {
      playerName: DataTypes.STRING,
      sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "PlayerSession", 
    }
  );
  return PlayerSession;
};