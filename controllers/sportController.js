const { Sport, Session, User } = require("../models");

// Dashboard (Show all sports)
module.exports.getDashboard = async (req, res) => {
  try {
    const allSports = await Sport.findAll({
      include: { model: User, attributes: ["firstName", "lastName"] }, 
      order: [["title", "ASC"]]
    });
    
    res.render("sports/index", { 
      title: "Dashboard", 
      allSports 
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Could not load sports");
    res.redirect("/");
  }
};

// Show Create Form
module.exports.getCreatePage = (req, res) => {
  res.render("sports/create", { title: "Create Sport" });
};

// Handle Create Logic
module.exports.createSport = async (req, res) => {
  try {
    const { title } = req.body;
    await Sport.create({ 
      title, 
      userId: req.user.id 
    });
    req.flash("success", "Sport created successfully!");
    res.redirect("/sports");
  } catch (error) {
    console.error(error);
    req.flash("error", error.message || "Failed to create sport");
    res.redirect("/sports/create");
  }
};

// Show Single Sport
module.exports.getSportDetails = async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.id, {
        include: User
    });
    
    if (!sport) {
        req.flash("error", "Sport not found");
        return res.redirect("/sports");
    }

    const upcomingSessions = await Session.getUpcoming(sport.id);
    const pastSessions = await Session.getPast(sport.id);

    res.render("sports/show", {
      title: sport.title,
      sport,
      upcomingSessions,
      pastSessions
    });
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Delete Sport
module.exports.deleteSport = async (req, res) => {
  try {
    // Only admin can delete
    const sport = await Sport.findByPk(req.params.id);
    
    if (sport.userId !== req.user.id && req.user.role !== 'admin') {
        req.flash("error", "You are not authorized to delete this sport.");
        return res.redirect("/sports");
    }

    await sport.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// Show Edit Sport Page
module.exports.getEditPage = async (req, res) => {
  try {
    const sport = await Sport.findByPk(req.params.id);
    
    // Authorization: Only Admin can edit
    if (sport.userId !== req.user.id && req.user.role !== 'admin') {
        req.flash("error", "Unauthorized");
        return res.redirect("/sports");
    }
    
    res.render("sports/edit", { title: "Edit Sport", sport });
  } catch (error) {
    console.error(error);
    res.redirect("/sports");
  }
};

// Handle Update Logic
module.exports.updateSport = async (req, res) => {
  try {
    const { title } = req.body;
    const sport = await Sport.findByPk(req.params.id);

    if (sport.userId !== req.user.id && req.user.role !== 'admin') {
        req.flash("error", "Unauthorized");
        return res.redirect("/sports");
    }

    await sport.update({ title });
    
    req.flash("success", "Sport renamed successfully!");
    res.redirect("/sports");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to update sport");
    res.redirect(`/sports/edit/${req.params.id}`);
  }
};