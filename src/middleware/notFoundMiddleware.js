import createError from 'http-errors';
import { asyncHandler } from '../utils/helper.js';

export const notFoundMiddleware = asyncHandler((req, res, next) => {
  throw new createError.BadRequest(
    `cannot find ${req.get('host')}${req.originalUrl} on the server`
  );
});
