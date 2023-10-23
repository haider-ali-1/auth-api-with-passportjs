import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../api/user/userModel.js';

const handleOAuthUser = async (done, { profile, refreshToken }) => {
  const { provider, id } = profile;
  const { name, picture, email, email_verified } = profile._json;

  let user = await User.findOne({ email, registerMethod: provider });

  if (!user) {
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
  } else {
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
