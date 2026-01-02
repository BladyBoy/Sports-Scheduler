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

// Allowing Express to trust the proxy (Load Balancer) used by Render.
app.set("trust proxy", 1); 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("super_secret_cookie_secret"));

// SESSION SETUP 
app.use(session({
    secret: process.env.SESSION_SECRET || "super-secret-key-session",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, 
        secure: process.env.NODE_ENV === "production", 
        httpOnly: true,
        sameSite: "lax"
    },
}));

// CSRF Protection 
app.use(csrf("12345678901234567890123456789012", ["POST", "PUT", "DELETE"]));

// Passport Config
require("./config/passport")(passport); 
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Global Local Variables
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.csrfToken = req.csrfToken(); 
  next();
});

// Routes
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

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`👉 Open your browser at: http://localhost:${PORT}\n`);
});

module.exports = app;