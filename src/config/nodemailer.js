import nodemailer from 'nodemailer';
import config from './config.js';

export const transporter = nodemailer.createTransport({
  host: config.NODEMAILER.HOST,
  port: config.NODEMAILER.PORT,
  secure: config.NODE_ENV === 'production',
  auth: {
    user: config.NODEMAILER.USERNAME,
    pass: config.NODEMAILER.PASSWORD,
  },
});
