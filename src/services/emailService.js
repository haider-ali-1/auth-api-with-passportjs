import { transporter } from '../config/nodemailer.js';

export const sendEmail = async (mailOptions) => {
  return transporter.sendMail(mailOptions);
};
