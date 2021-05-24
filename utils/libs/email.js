const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.CBA_SMTP_HOST,
    port: process.env.CBA_SMTP_PORT,
    auth: {
      user: process.env.CBA_SMTP_USER,
      pass: process.env.CBA_SMTP_PASSWORD,
    },
  });
  const message = {
    from: `${process.env.CBA_EMAIL_FROM_NAME} <${process.env.CBA_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
