import createError from 'http-errors';
import { transporter } from '../config/nodemailer.js';

export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};
