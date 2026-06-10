const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_SENDER,
      subject,
      text,
    };

    const [response] = await sgMail.send(msg);
    console.log("Email sent:", response.statusCode, response.headers);
    return response;
  } catch (error) {
    console.error("Failed sending email:", error);
    if (error.response) {
      console.error("SendGrid response body:", error.response.body);
    }
    throw error;
  }
};

module.exports = sendEmail;