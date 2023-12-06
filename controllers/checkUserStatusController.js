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

const verifyCodeAndReturnStatus = async (req, res) => {
  try {
      const { email, userType, code } = req.body;
      const isValid = await checkVerificationCode(email, userType, code);

      if (isValid) {
          const status = await getUserStatus(email, userType);
          res.status(200).json({ message: "Verification successful", status: status });
      } else {
          res.status(400).json({ message: "Invalid verification code" });
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
  }
};

const getUserStatus = async (email, userType) => {
  const table = userType === 'student' ? 'student_applications' : 'coach_applications';
  try {
      const query = `SELECT status FROM ${table} WHERE email = $1`;
      const result = await pool.query(query, [email]);
      if (result.rows.length > 0) {
          return result.rows[0].status;
      } else {
          throw new Error('User not found');
      }
  } catch (error) {
      console.error('Error fetching user status:', error.message);
      throw error;
  }
};

module.exports = {
  findUserByEmail,
  sendVerificationCode,
  updateUserVerificationCode,
  verifyCodeAndReturnStatus
};