const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user')
const config = require('../config/database')
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = function (passport) {
    // LOCAL STRATEGY
    passport.use(new LocalStrategy((username, password, done) => {
        //macth username
        let query = { username: username };//callback
        User.findOne(query, function (err, user) {
            if (err)
                throw err;
                //check if there is user
            if (!user) {
                //if no user->false
                return done(null, false, { message: 'No user found' });
            }

            // Match Password test pword and check if match user object password value
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err)
                    throw err;
                    //if password is true
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Wrong password!" });
                }
            });
        });
    }))

}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) =>
    User.findById(id, (err, user) =>
        done(err, user)
    )
);
