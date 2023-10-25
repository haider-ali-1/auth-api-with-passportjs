import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

export const generateAccessAndRefreshTokens = (user) => {
  const { _id, name, role } = user;
  const accessTokenPayload = { _id, name, role };
  const refreshTokenPayload = { _id };

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: config.ACCESS_TOKEN_EXPIRE_TIME,
    }
  );
  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: config.REFRESH_TOKEN_EXPIRE_TIME,
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
