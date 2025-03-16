const fs = require('fs');
const path = require('path');
const transporter = require('../config/nodemailer');

const sendEmailForRental = (to, subject, templateName, replacements) => {
    const templatePath = "./templates/rentalConfirmationEmail.html";
    let htmlContent = fs.readFile(templatePath, 'utf8');
  
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
  module.exports = {sendEmailForRental};
