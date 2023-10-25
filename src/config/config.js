import ms from 'ms';

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  MONGODB: {
    URL: process.env.MONGO_URL,
  },

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  },

  JWT: {
    ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  },

  NODEMAILER: {
    HOST: process.env.NODEMAILER_HOST,
    PORT: process.env.NODEMAILER_PORT,
    USERNAME: process.env.NODEMAILER_USERNAME,
    PASSWORD: process.env.NODEMAILER_PASSWORD,
  },

  // Settings

  ACCESS_TOKEN_EXPIRE: ms('15m'),
  REFRESH_TOKEN_EXPIRE: ms('24h'),
  EMAIL_VERIFICATION_TOKEN_EXPIRE: ms('30m'),
  PASSWORD_RESET_TOKEN_EXPIRE: ms('30m'),
};
