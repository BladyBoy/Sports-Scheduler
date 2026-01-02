const { Session, Sport, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

module.exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sessions = [];
    let sportStats = [];

    if (startDate && endDate) {
        // Getting the detailed list of sessions
        sessions = await Session.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            },
            include: [
                { model: Sport, attributes: ['title'] },
                { model: User, as: 'User', attributes: ['firstName', 'lastName'] }
            ],
            order: [['date', 'ASC']]
        });

        // Getting Statistics (Count sessions per sport)
        sportStats = await Session.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            },
            attributes: [
                'sportId',
                [sequelize.fn('COUNT', sequelize.col('Session.id')), 'count']
            ],
            include: [{ model: Sport, attributes: ['title'] }],
            group: ['sportId', 'Sport.id', 'Sport.title'], 
            order: [[sequelize.literal('count'), 'DESC']]
        });
    }

    res.render("reports/index", {
        title: "Session Reports",
        sessions,
        sportStats, 
        startDate,
        endDate
    });

  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to generate report");
    res.redirect("/sports");
  }
};