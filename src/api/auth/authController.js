import ms from 'ms';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

import User from '../user/userModel.js';
import { asyncHandler } from '../../utils/helper.js';
import { sendEmail } from '../../services/emailService.js';
import { jwtConfig } from '../../config/jwt.js';
import {
  generateAccessAndRefreshTokens,
  generateCryptoToken,
  setCookie,
  clearCookie,
} from './authHelper.js';
import { USER_REGISTER_METHODS } from '../user/userConstants.js';

// handle OAuth login
export const handleOAuthLogin = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshTokens = [...user.refreshTokens, refreshToken];
  await user.save();

  setCookie(res, 'jwt', refreshToken, jwtConfig.refreshTokenExpire);
  res
    .status(StatusCodes.OK)
    .redirect(`http://localhost:5000/dashboard?${accessToken}`);
});

// @ Register User
// @ POST /api/v1/auth/register

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const role = (await User.countDocuments()) === 0 ? ['admin'] : ['user'];

  // const user = await User.findOne({ email });

  // set role admin for first user register
  const { token, hashedToken } = generateCryptoToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: Date.now() + ms('15m'),
  });

  const verificationURL = `${req.protocol}://${req.get('host')}${
    req.baseUrl
  }/verify-email/${token}`;
  const message = `please click on the below link for email verification\n${verificationURL}\nlink will expire after 15 minutes`;

  const mailOptions = {
    from: '<admin@authAPI.com>',
    to: user.email,
    subject: 'email verification',
    text: message,
  };

  await sendEmail(mailOptions);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'verification email has been sent to your mail address',
  });
});

// @ Resend Email Verification
// /api/v1/auth/resend-email-verification

export const resendEmail = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound('user does not exist');

  if (user.isVerified)
    throw new createError.BadRequest('email already verified');

  const { token, hashedToken } = generateCryptoToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  try {
    // prettier-ignore
    const verificationURL = `${req.protocol}://${req.get('host')}${req.baseUrl}/verify-email/${token}`
    const message = `please click on the below link for email verification\n${verificationURL}\nlink will expire after 15 minutes`;

    const mailOptions = {
      from: '<admin@authAPI.com>',
      to: user.email,
      subject: 'email verification',
      text: message,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    throw new createError.InternalServerError('failed to send email');
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'email has been sent to your mail address for email verification',
  });
});

// @ verify email verification token
// @ GET /api/v1/auth/verify-email/:token

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  const { hashedToken } = generateCryptoToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: { $gte: Date.now() },
  });

  if (!user)
    throw new createError.NotFound(
      'verification token is invalid or expire please request a new one'
    );

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpireAt = undefined;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'your email is verified now' });
});

// @ Login User
// @ POST /api/v1/auth/login

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are correct
  const user = await User.findOne({ email });
  const passwordMatch = await user?.compareWithHash(password, 'password');
  if (!user || !passwordMatch)
    throw new createError.NotFound('incorrect email or password');

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshTokens = [...user.refreshTokens, refreshToken];
  await user.save();
  setCookie(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000); // 24 hours

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'logged in successfully',
    accessToken,
  });
});

// @ Logout User
// @ POST /api/v1/auth/login

export const logoutUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  // check if refresh token exist
  if (!token) throw new createError.Unauthorized('unauthorized request');

  // remove refresh token from db
  const user = await User.findById(req.user?._id);

  if (!user) throw new createError.NotFound('user does not exist');

  user.refreshTokens = user.refreshTokens.filter((rt) => rt !== token);
  await user.save();

  // remove refresh token from cookies
  clearCookie(res, 'jwt');
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'logged out successfully' });
});

// @ Refresh Access Token
// @ POST /api/v1/auth/refresh-token

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  // check if refresh token found
  const token = req.cookies?.jwt || req.body.refreshToken;
  if (!token) throw new createError.Unauthorized('unauthorized request');

  // check if refresh token is invalid (if RT expire it will return error)
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

  // check if user exist (use select)
  const user = await User.findById(decoded?._id);
  if (!user) throw new createError.Unauthorized('user does not exist');

  // check if refresh token reuse
  if (!user.refreshTokens.includes(token)) {
    // detected refresh token reuse logout from all
    user.refreshTokens = [];
    await user.save();

    throw new createError.Unauthorized('access denied token reuse detected');
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  // replace previous token with new
  user.refreshTokens = user.refreshTokens.map((rt) =>
    rt === token ? refreshToken : rt
  );

  await user.save();

  setCookie(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000);
  res.status(StatusCodes.OK).json({ status: 'success', accessToken });
});

// @ Forgot Password
// @ POST /api/v1/auth/forgot-password

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    if (user.registerMethod !== USER_REGISTER_METHODS.EMAIL_PASSWORD) {
      throw new createError.BadRequest(
        `you had signed up using ${user.registerMethod} please use continue with ${user.registerMethod} for login`
      );
    }
  } else {
    throw new createError.NotFound('user does not exist');
  }

  // send email for password reset
  try {
    const { token, hashedToken } = generateCryptoToken();

    // prettier-ignore
    const passwordResetURL = `${req.protocol}://${req.get('host')}${req.baseUrl}/reset-password/${token}`
    const message = `please click on the below link for reset password\n${passwordResetURL}\nlink will expire after 15 minutes`;

    const mailOptions = {
      from: '<admin@authAPI.com>',
      to: user.email,
      subject: 'password reset',
      text: message,
    };

    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();
    await sendEmail(mailOptions);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'email has been sent to your mail address for reset password',
    });
  } catch (error) {
    throw new createError.InternalServerError('failed to send email');
  }
});

// @ Reset Password
// @ PATCH /api/v1/users/auth/reset-password/:token

export const resetPassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const { password } = req.body;

  const { hashedToken } = generateCryptoToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpireAt: { $gte: Date.now() },
  });

  // check token validity
  if (!user)
    throw new createError.Unauthorized(
      'password reset token is invalid or expire please request a new one'
    );

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpireAt = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'your password has been reset successfully',
  });
});
