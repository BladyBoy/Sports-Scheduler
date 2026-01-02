const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Check if user exists
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return done(null, false, { message: "Email not registered" });
          }

          // Check Password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
          }

          // Success
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize: Save user ID to session cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize: Read ID from cookie and find user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};