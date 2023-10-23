import passport from 'passport';
import '../../config/passport.js';

import { Router } from 'express';

import {
  forgotPassword,
  handleOAuthLogin,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmail,
  resetPassword,
  verifyEmail,
} from './authController.js';

import {
  forgotPasswordValidator,
  loginUserValidator,
  registerUserValidator,
  resetPasswordValidator,
} from './authValidation.js';

import { ensureAuthenticated } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerUserValidator, registerUser);
router.post('/resend-email-verification', ensureAuthenticated, resendEmail);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUserValidator, loginUser);
router.post('/logout', ensureAuthenticated, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, resetPassword);

// Google
router.route('/google').get(
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: ['email', 'profile'],
  })
);

router.route('/google/callback').get(
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  handleOAuthLogin
);

export { router };
