require('dotenv').config();

const { Pool } = require("pg");
const nodemailer = require('nodemailer');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
});

const checkExistingStudent = async (first_name, last_name, email) => {
  const result = await pool.query(
    "SELECT * FROM student_applications WHERE first_name = $1 AND last_name = $2 AND email = $3",
    [first_name, last_name, email]
  );
  return result.rows.length > 0;
};

const createNewStudent = async (data) => {
  const {
    first_name,
    last_name,
    email,
    province,
    city,
    address,
    postal_code,
    date_of_birth,
    pronoun,
    institution_name,
    program_name,
    emergency_contact_first_name,
    emergency_contact_last_name,
    emergency_contact_phone,
    emergency_contact_relation,
  } = data;
  const result = await pool.query(
    "INSERT INTO student_applications (first_name, last_name, email, province, city, address, postal_code, date_of_birth, pronoun, institution_name, program_name, emergency_contact_first_name, emergency_contact_last_name, emergency_contact_phone, emergency_contact_relation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
    [
        first_name,
        last_name,
        email,
        province,
        city,
        address,
        postal_code,
        date_of_birth,
        pronoun,
        institution_name,
        program_name,
        emergency_contact_first_name,
        emergency_contact_last_name,
        emergency_contact_phone,
        emergency_contact_relation
    ]
  );
  const mailOptions = {
    from: 'canadiancoachestest@gmail.com',
    to: email,
    subject: 'Application Submitted Successfully',
    text: 'Thank you '+first_name+' '+last_name+ ' for submitting your application to Canadian Higher Ed Coaches. Your status is "pending"'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error(error.message);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  return result.rows[0];
};

module.exports = {
  checkExistingStudent,
  createNewStudent,
};