import { body } from 'express-validator';
import { USER_ROLES } from './userConstants.js';
import { validate } from '../../utils/validation.js';

export const updateUserValidator = validate([
  body('email')
    .if(body('email').notEmpty())
    .isEmail()
    .withMessage('invalid email format'),
]);

export const updateUserRoleValidator = validate([
  body('role')
    .isIn([USER_ROLES.USER, USER_ROLES.ADMIN])
    .withMessage('invalid role type'),
]);
