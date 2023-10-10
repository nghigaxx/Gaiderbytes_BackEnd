const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Fetch limited details for coaches with fewer than 10 students and status 'verified'
const getAvailableCoachLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;
        const queryValue = `%${value}%`; // Allow for partial matching

        if (searchParam && value) {
            result = await pool.query(`
                SELECT id, first_name, last_name, email
                FROM coach_applications
                WHERE id NOT IN (
                    SELECT coach_id 
                    FROM student_applications 
                    GROUP BY coach_id 
                    HAVING COUNT(id) >= 10
                )
                AND status ILIKE 'verified'
                AND ${searchParam} ILIKE $1
            `, [queryValue]);
        } else {
            result = await pool.query(`
                SELECT id, first_name, last_name, email
                FROM coach_applications
                WHERE id NOT IN (
                    SELECT coach_id 
                    FROM student_applications 
                    GROUP BY coach_id 
                    HAVING COUNT(id) >= 10
                )
                AND status ILIKE 'verified'
            `);
        }

        res.status(225).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetch limited details for students who are not yet matched
const getUnmatchedStudentLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;
        const queryValue = `%${value}%`; // Allow for partial matching

        if (searchParam && value) {
            result = await pool.query(`
                SELECT id, first_name, last_name, email, status 
                FROM student_applications
                WHERE coach_id IS NULL
                AND ${searchParam} ILIKE $1
            `, [queryValue]);
        } else {
            result = await pool.query(`
                SELECT id, first_name, last_name, email, status 
                FROM student_applications
                WHERE coach_id IS NULL
            `);
        }

        res.status(235).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAvailableCoachLimitedDetails,
    getUnmatchedStudentLimitedDetails
};