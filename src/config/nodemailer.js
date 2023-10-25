import nodemailer from 'nodemailer';

const {
  NODEMAILER_HOST,
  NODEMAILER_PORT,
  NODEMAILER_USERNAME,
  NODEMAILER_PASSWORD,
  NODE_ENV,
} = process.env;

export const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST,
  port: NODEMAILER_PORT,
  secure: NODE_ENV === 'production',
  auth: {
    user: NODEMAILER_USERNAME,
    pass: NODEMAILER_PASSWORD,
  },
});
