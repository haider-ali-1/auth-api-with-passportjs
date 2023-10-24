import { transporter } from '../config/nodemailer.js';

export const sendEmail = (mailOptions) => transporter.sendMail(mailOptions);
