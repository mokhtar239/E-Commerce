const Passport = require('passport');
const GoogleStartegy = require('passport-google-oauth20').Strategy;
const User = require('../models/sql/User');
const {sendWelcomeEmail} = require('../utils/email');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
Passport.use(new GoogleStartegy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}
 , async (accessToken , refreshToken , profile , done) => {
    try{
        const name = profile.displayName;
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // user already logged in with Google
        let user = await User.findOne({where : {googleId}});

        if (user){
            return done(null , user);
        }

        // register before but not linked with Google
        user = await User.findOne({where : {email}});
        if (user){
            user.googleId = googleId;
            await user.save({ fields: ['googleId'] });
            return done(null , user);
        }

        user = await User.create({name , email , googleId , isVerified : true , role : "buyer"});   
        sendWelcomeEmail(user).catch(err => console.error("Failed to send welcome email:", err));
        return done(null , user); 
    }
    catch(err){
        console.error("Error occurred while processing Google authentication:", err);
        return done(err , null);
    }
 }
));
} else {
    console.warn("⚠️  Google OAuth disabled — GOOGLE_CLIENT_ID/SECRET not set in .env");
}
module.exports = Passport;