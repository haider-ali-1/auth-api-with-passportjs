import ms from 'ms';

export const jwtConfig = {
  accessTokenSecret:
    'e6df113a787f434bdcd5119e758b617d851c6cb8bb2074f4d4bcf75277bca59c',
  refreshTokenSecret:
    'c77d5b5c95a1eb603d2e592e39dc6645b146d028400219bfab233c0a9d7e5911',
  accessTokenExpire: ms('10s'),
  refreshTokenExpire: ms('24h'),
};
