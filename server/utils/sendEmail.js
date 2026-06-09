const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === "true" || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify()
  .then(() => {
    console.log("Email transporter verified");
  })
  .catch((err) => {
    console.error("Email transporter verification failed:", err);
  });

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed sending email:", error);
    throw error;
  }
};

console.log("Email user:", process.env.EMAIL_USER);
module.exports = sendEmail;