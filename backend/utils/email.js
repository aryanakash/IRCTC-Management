require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📌 Reusable function to send emails
const sendEmail = async (toEmail, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text,
    html, // HTML version for better formatting
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📨 Email sent to ${toEmail} - ${subject}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${toEmail}:`, error);
    return false;
  }
};

// 📧 **Booking Confirmation Email**
exports.sendBookingEmail = async (toEmail, { ticketNumber, passengerName, trainName, travelDate }) => {
  const subject = "🎟️ IRCTC Booking Confirmation";
  const text = `
Hi ${passengerName},

✅ Your booking is confirmed!

🎫 Ticket Number: ${ticketNumber}
🚆 Train: ${trainName}
📅 Travel Date: ${travelDate}

Thank you for using IRCTC!
  `;
  const html = `
    <h2>✅ Your booking is confirmed!</h2>
    <p><strong>Passenger Name:</strong> ${passengerName}</p>
    <p><strong>🎫 Ticket Number:</strong> ${ticketNumber}</p>
    <p><strong>🚆 Train:</strong> ${trainName}</p>
    <p><strong>📅 Travel Date:</strong> ${travelDate}</p>
    <p>Thank you for using IRCTC!</p>
  `;

  return sendEmail(toEmail, subject, text, html);
};

// ❌ **Booking Cancellation Email**
exports.sendCancellationEmail = async (toEmail, { ticketNumber, passengerName, trainName, travelDate }) => {
  const subject = "❌ IRCTC Booking Cancelled";
  const text = `
Hi ${passengerName},

⚠️ Your booking has been cancelled.

🎫 Ticket Number: ${ticketNumber}
🚆 Train: ${trainName}
📅 Travel Date: ${travelDate}

We hope to serve you again on your next journey!

- IRCTC Team
  `;
  const html = `
    <h2>⚠️ Your booking has been cancelled.</h2>
    <p><strong>Passenger Name:</strong> ${passengerName}</p>
    <p><strong>🎫 Ticket Number:</strong> ${ticketNumber}</p>
    <p><strong>🚆 Train:</strong> ${trainName}</p>
    <p><strong>📅 Travel Date:</strong> ${travelDate}</p>
    <p>We hope to serve you again on your next journey!</p>
  `;

  return sendEmail(toEmail, subject, text, html);
};

// 🔐 **OTP Verification Email**
exports.sendVerificationEmail = async (toEmail, { name, otp }) => {
  const subject = "🔐 IRCTC Email Verification OTP";
  const text = `
Hi ${name},

Your OTP for email verification is: ${otp}

This OTP is valid for 10 minutes.

- IRCTC Team
  `;
  const html = `
    <h2>🔐 Your OTP for email verification</h2>
    <p><strong>Hi ${name},</strong></p>
    <p>Your OTP for email verification is: <strong style="font-size:20px;">${otp}</strong></p>
    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
    <p>- IRCTC Team</p>
  `;

  return sendEmail(toEmail, subject, text, html);
};
