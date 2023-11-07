const pool = require('../dbPool');
const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: "canadiancoachestest@gmail.com",
        to: to,
        subject: subject,
        text: text
    };
    
    return transporter.sendMail(mailOptions);
};

const sendMatchEmail = async (student, coach) => {
    await sendEmail(
        student.email,
        "Matched with a Coach",
        `Hello ${student.first_name} ${student.last_name},\n\nYou have been matched with Coach ${coach.first_name} ${coach.last_name}. You can contact them at ${coach.email}.`
    );
    

    await sendEmail(
        coach.email,
        "Matched with a Student",
        `Hello ${coach.first_name} ${coach.last_name},\n\nYou have been matched with Student ${student.first_name} ${student.last_name}. You can contact them at ${student.email}.`
    );
};

const CheckMatchValidity = async (studentId, coachId) => {
    const studentResult = await pool.query("SELECT coach_id FROM student_applications WHERE id = $1", [studentId]);
    if (studentResult.rows[0].coach_id) {
        throw { code: 406, message: "Student already matched" };
    }
    

    const coachWorkload = await pool.query("SELECT COUNT(*) as count FROM student_applications WHERE coach_id = $1", [coachId]);
    if (coachWorkload.rows[0].count >= 10) {
        throw { code: 416, message: "Coach workload limit reached" };
    }
};

const matchStudentWithCoach = async (studentId, coachId) => {
    await CheckMatchValidity(studentId, coachId);
    
    await pool.query("UPDATE student_applications SET coach_id = $1, status = 'matched' WHERE id = $2", [coachId, studentId]);

    const studentData = await pool.query("SELECT first_name, last_name, email FROM student_applications WHERE id = $1", [studentId]);
    const coachData = await pool.query("SELECT first_name, last_name, email FROM coach_applications WHERE id = $1", [coachId]);
    
    await sendMatchEmail(studentData.rows[0], coachData.rows[0]);
};

module.exports = {
    CheckMatchValidity,
    matchStudentWithCoach
};