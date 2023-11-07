const pool = require('../dbPool');
require("dotenv").config();



const getCoachFullDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM coach_applications WHERE id = $1", [id]);
        res.status(255).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getCoachLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;

        if (searchParam && value) {
            const queryValue = `%${value}%`;

            if (searchParam === "name") {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institutions, post_secondary_program FROM coach_applications WHERE CONCAT(first_name, ' ', last_name) ILIKE $1`, [queryValue]);
            } else if (searchParam === "id") {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institutions, post_secondary_program FROM coach_applications WHERE id = $1`, [parseInt(value)]);
            } else {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institutions, post_secondary_program FROM coach_applications WHERE ${searchParam} ILIKE $1`, [queryValue]);
            }
        } else {
            result = await pool.query("SELECT id, first_name, last_name, email, status, institutions, post_secondary_program FROM coach_applications");
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getStudentLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;

        if (searchParam && value) {
            const queryValue = `%${value}%`;

            if (searchParam === "name") {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institution_name, program_name FROM student_applications WHERE CONCAT(first_name, ' ', last_name) ILIKE $1`, [queryValue]);
            } else if (searchParam === "id") {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institution_name, program_name FROM student_applications WHERE id = $1`, [parseInt(value)]);
            } else {
                result = await pool.query(`SELECT id, first_name, last_name, email, status, institution_name, program_name FROM student_applications WHERE ${searchParam} ILIKE $1`, [queryValue]);
            }
        } else {
            result = await pool.query("SELECT id, first_name, last_name, email, status, institution_name, program_name FROM student_applications");
        }

        res.status(215).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getStudentFullDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM student_applications WHERE id = $1", [id]);
        res.status(265).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getCoachLimitedDetails,
    getCoachFullDetails,
    getStudentLimitedDetails,
    getStudentFullDetails
};