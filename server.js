const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Main_DB",
  password: "2704",
  port: "8888",
});

app.post("/studentApplication", async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const existingStudent = await pool.query(
      "SELECT * FROM student_applications WHERE first_name = $1 AND last_name = $2 AND email = $3",
      [first_name, last_name, email]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ message: "Student already applied" });
    }

    const {
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
    } = req.body;

    const newStudent = await pool.query(
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
        emergency_contact_relation,
      ]
    );

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});