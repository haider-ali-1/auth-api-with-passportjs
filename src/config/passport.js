import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { handleOAuthSignup } from '../api/auth/authController.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      accessType: 'offline',
      prompt: 'consent',
    },
    async (_, __, profile, done) => {
      handleOAuthSignup(profile, done);
    }
  )
);
