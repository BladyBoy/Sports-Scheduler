const { Session, Sport, User, PlayerSession } = require("../models");
const { Op } = require("sequelize");

// Show Create Page
module.exports.getCreatePage = async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.sportId);
    if (!sport) {
        req.flash("error", "Sport not found");
        return res.redirect("/sports");
    }
    res.render("sessions/create", { title: "Create Session", sport });
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Create Session
module.exports.createSession = async (req, res) => {
  try {
    const { sessionName, date, time, venue, playersNeeded, sportId } = req.body;
    await Session.create({
      sessionName,
      date,
      time,
      venue,
      playersNeeded: parseInt(playersNeeded),
      sportId,
      userId: req.user.id
    });
    req.flash("success", "Session scheduled!");
    res.redirect(`/sports/${sportId}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to create session");
    res.redirect(`/sports/${req.body.sportId}`);
  }
};

// View Session Details
module.exports.getSessionDetails = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      include: [
        { model: Sport },
        { model: User, as: 'User' },
        { model: PlayerSession, include: { model: User, attributes: ['firstName', 'lastName'] } }
      ]
    });

    if (!session) return res.redirect("/sports");

    const isJoined = session.PlayerSessions.some(p => p.userId === req.user.id);
    const isOrganizer = session.userId === req.user.id;

    res.render("sessions/show", { 
      title: session.sessionName, 
      session, 
      isJoined,
      isOrganizer
    });
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Join Session
module.exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const existing = await PlayerSession.findOne({ where: { sessionId, userId: req.user.id } });
    
    if (!existing) {
        await PlayerSession.create({ sessionId, userId: req.user.id, playerName: req.user.firstName });
        const session = await Session.findByPk(sessionId);
        if (session.playersNeeded > 0) await session.decrement('playersNeeded');
        req.flash("success", "Joined successfully!");
    }
    res.redirect(`/sessions/${sessionId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Leave Session
module.exports.leaveSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        await PlayerSession.destroy({ where: { sessionId, userId: req.user.id } });
        const session = await Session.findByPk(sessionId);
        await session.increment('playersNeeded');
        req.flash("info", "Left the session.");
        res.redirect(`/sessions/${sessionId}`);
    } catch (error) {
        console.error(error);
        res.redirect("/sports");
    }
};

// Kick Player (Organizer Only)
module.exports.removePlayer = async (req, res) => {
    try {
        const playerSessionId = req.params.id;
        const playerEntry = await PlayerSession.findByPk(playerSessionId, { include: Session });
        
        // Security Check: Only the Session Organizer can kick people
        if (playerEntry.Session.userId === req.user.id) {
            await playerEntry.destroy();
            await playerEntry.Session.increment('playersNeeded');
            req.flash("success", "Player removed.");
        } else {
            req.flash("error", "Unauthorized");
        }
        res.redirect(`/sessions/${playerEntry.sessionId}`);
    } catch (error) {
        console.error(error);
        res.redirect("/sports");
    }
};

// View History
module.exports.getHistory = async (req, res) => {
    try {
        const sport = await Sport.findByPk(req.params.sportId);
        const pastSessions = await Session.getPast(req.params.sportId); 
        
        res.render("sessions/history", {
            title: "Session History",
            sport,
            pastSessions
        });
    } catch (error) {
        console.error(error);
        res.redirect("/sports");
    }
};

// Show Edit Form (Organizer Only)
module.exports.getEditPage = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (session.userId !== req.user.id) {
        req.flash("error", "You can only edit sessions you created.");
        return res.redirect(`/sessions/${session.id}`);
    }
    res.render("sessions/edit", { title: "Edit Session", session });
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Handle Edit Update
module.exports.updateSession = async (req, res) => {
  try {
    const { sessionName, date, time, venue, playersNeeded } = req.body;
    const session = await Session.findByPk(req.params.id);

    if (session.userId !== req.user.id) {
        req.flash("error", "Unauthorized");
        return res.redirect("/sports");
    }

    await session.update({
        sessionName, date, time, venue, 
        playersNeeded: parseInt(playersNeeded)
    });

    req.flash("success", "Session updated successfully!");
    res.redirect(`/sessions/${session.id}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Update failed");
    res.redirect(`/sessions/edit/${req.params.id}`);
  }
};

//  Show Cancel Page
module.exports.getCancelPage = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (session.userId !== req.user.id) {
            req.flash("error", "Unauthorized");
            return res.redirect(`/sessions/${session.id}`);
        }
        res.render("sessions/cancel", { title: "Cancel Session", session });
    } catch (error) {
        console.error(error);
        res.redirect("/sports");
    }
};

//  Handle Cancellation
module.exports.cancelSession = async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        if (session.userId !== req.user.id) {
            req.flash("error", "Unauthorized");
            return res.redirect("/sports");
        }

        await session.update({
            canceled: true,
            message: req.body.message // Saving the reason
        });

        req.flash("success", "Session canceled.");
        res.redirect(`/sessions/${session.id}`);
    } catch (error) {
        console.error(error);
        res.redirect("/sports");
    }
};