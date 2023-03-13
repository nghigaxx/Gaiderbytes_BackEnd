const { Pool } = require("pg");

const pool = new Pool({
    ser: "postgres",
    host: "localhost",
    database: "Main_DB",
    password: "2704",
    port: "8888",
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
    "INSERT INTO student_applications (first_name, last_name, email, province, city, address, postal_code, date_of_birth, pronoun, institution_name, program_name, password, emergency_contact_first_name, emergency_contact_last_name, emergency_contact_phone, emergency_contact_relation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *",
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
  return result.rows[0];
};

module.exports = {
  checkExistingStudent,
  createNewStudent,
};