import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.js';

export const generateAccessAndRefreshTokens = (user) => {
  const { _id, name, role } = user;
  const accessTokenPayload = { _id, name, role };
  const refreshTokenPayload = { _id };

  const accessToken = jwt.sign(
    accessTokenPayload,
    jwtConfig.accessTokenSecret,
    {
      expiresIn: jwtConfig.accessTokenExpire,
    }
  );
  const refreshToken = jwt.sign(
    refreshTokenPayload,
    jwtConfig.refreshTokenSecret,
    {
      expiresIn: jwtConfig.refreshTokenExpire,
    }
  );
  return { accessToken, refreshToken };
};

export const generateCryptoToken = (randomToken) => {
  const token = randomToken || crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};

export const setCookie = (res, name, value, age) => {
  res.cookie(name, value, {
    maxAge: age,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};
