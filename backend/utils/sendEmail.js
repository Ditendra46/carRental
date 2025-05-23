// filepath: /c:/Users/diten/Desktop/Gen AI/Angular/carRental/backend/utils/sendEmail.js
const fs = require('fs');
const path = require('path');
const transporter = require('../config/nodemailer');

const sendEmail = (to, subject, templateName, replacements) => {
  const templatePath = "./templates/welcomeEmail.html";
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  for (const key in replacements) {
    htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = {sendEmail};