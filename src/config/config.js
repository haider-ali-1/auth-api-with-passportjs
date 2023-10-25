import ms from 'ms';

export default {
  accessTokenExpireTime: ms('15m'),
  refreshTokenExpireTime: ms('24h'),
  emailVerificationTokenExpireTime: ms('30m'),
  passwordResetTokenExpireTime: ms('30m'),
};
