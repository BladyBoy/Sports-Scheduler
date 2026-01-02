/* eslint-disable no-undef */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config(); 

// 1. App Configuration (Views & Static)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 2. Parsers (MUST BE BEFORE CSRF)
// These allow the app to read the inputs from the form
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("super_secret_cookie_secret"));

// 3. Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || "super-secret-key-session",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
}));

// 4. CSRF Protection (MUST BE AFTER SESSION & PARSERS)
// The secret must be exactly 32 chars.
app.use(csrf("12345678901234567890123456789012", ["POST", "PUT", "DELETE"]));

// 5. Passport Config (The Missing Link!)
require("./config/passport")(passport); // <-- THIS LOADS THE STRATEGY
app.use(passport.initialize());
app.use(passport.session());

// 6. Flash Messages
app.use(flash());

// 7. Global Local Variables
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.csrfToken = req.csrfToken(); 
  next();
});

// 8. Routes
const authRoutes = require('./routes/authRoutes');
const sportRoutes = require('./routes/sportRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/', authRoutes);
app.use('/sports', sportRoutes);
app.use('/sessions', sessionRoutes);
app.use('/reports', reportRoutes);

// Landing Page
app.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/sports");
  }
  return res.render("index", { title: "Sports Scheduler" });
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`👉 Open your browser at: http://localhost:${PORT}\n`);
});

module.exports = app;