const pool = require('../dbPool');
require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

const findUserByEmail = async (email, userType) => {
  const table = userType === "student" ? "student_applications" : "coach_applications";
  const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
  return result.rows[0];
};

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${code}`,
  };
  await transporter.sendMail(mailOptions);
};

const updateUserVerificationCode = async (email, userType, code) => {
  const table = userType === "student" ? "student_applications" : "coach_applications";
  await pool.query(`UPDATE ${table} SET verification_code = $1 WHERE email = $2`, [code, email]);
};

const checkVerificationCode = async (email, userType, code) => {
  const table = userType === "student" ? "student_applications" : "coach_applications";
  const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1 AND verification_code = $2`, [email, code]);
  return result.rows.length > 0;
};

module.exports = {
  findUserByEmail,
  sendVerificationCode,
  updateUserVerificationCode,
  checkVerificationCode,
};