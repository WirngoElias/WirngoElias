const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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