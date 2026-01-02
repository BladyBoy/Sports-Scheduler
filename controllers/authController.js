const bcrypt = require("bcrypt");
const { User } = require("../models");
const passport = require("passport");
const saltRounds = 10;

// Signup Page
module.exports.signupPage = (req, res) => {
  res.render("users/signup", { title: "Signup" });
};

// Login Page
module.exports.loginPage = (req, res) => {
  if (req.user) return res.redirect("/sports");
  res.render("users/login", { title: "Login" });
};

// Handle User Creation
module.exports.createUser = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  
  if (password.length < 8) {
    req.flash("error", "Password must be at least 8 characters");
    return res.redirect("/signup");
  }
  
  try {
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      firstName, lastName, email, role, password: hashedPwd
    });
    
    // Auto login after signup
    req.login(user, (err) => {
      if (err) console.log(err);
      res.redirect("/sports");
    });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message || "Signup failed");
    res.redirect("/signup");
  }
};

// Handle Login (Passport Middleware)
module.exports.loginUser = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
  successRedirect: "/sports"
});

// Handle Signout
module.exports.signout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};