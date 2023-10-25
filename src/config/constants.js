import ms from 'ms';

const constants = {
  jwt: {},
  email: {
    verificationTokenExpire: Date.now() + ms('15m'),
  },
};
