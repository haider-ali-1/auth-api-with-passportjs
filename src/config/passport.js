import passport from 'passport';
import createError from 'http-errors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { USER_REGISTER_METHODS } from '../api/user/userConstants.js';
import User from '../api/user/userModel.js';

const handleOAuthUser = async (done, { profile, refreshToken }) => {
  const { provider, id } = profile;
  const { name, picture, email, email_verified } = profile._json;

  let user = await User.findOne({ email });

  if (user) {
    if (user.registerMethod === USER_REGISTER_METHODS.EMAIL_PASSWORD) {
      const error = new createError.Conflict(
        `you already signup using email and password please use email & password for login`
      );
      done(error);
    }

    done(null, user);
  } else {
    user = await User.create({
      name,
      email,
      registerMethod: provider,
      [`${provider}Id`]: id,
      profileImage: picture,
      provider,
      isVerified: email_verified,
    });
    done(null, user);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      accessType: 'offline',
      prompt: 'consent',
    },
    async (accessToken, refreshToken, profile, done) => {
      handleOAuthUser(done, { profile, refreshToken });
    }
  )
);
