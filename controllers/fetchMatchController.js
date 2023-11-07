const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const getAvailableCoachLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;
        let query = "";
        const values = [];
        const maxStudentsPerCoach = process.env.STUDENT_LIMIT

        if (searchParam && value) {
            if (searchParam === "name") {
                query = `
                    SELECT id, first_name, last_name, email
                    FROM coach_applications
                    WHERE id NOT IN (
                        SELECT coach_id 
                        FROM student_applications 
                        GROUP BY coach_id 
                        HAVING COUNT(id) >= $1
                    )
                    AND status ILIKE 'verified'
                    AND CONCAT(first_name, ' ', last_name) ILIKE $2
                `;
                values.push(maxStudentsPerCoach,`%${value}%`);
            } else if (searchParam === "id") {
                query = `
                    SELECT id, first_name, last_name, email
                    FROM coach_applications
                    WHERE id NOT IN (
                        SELECT coach_id 
                        FROM student_applications 
                        GROUP BY coach_id 
                        HAVING COUNT(id) >= $1
                    )
                    AND status ILIKE 'verified'
                    AND id = $2
                `;
                values.push(maxStudentsPerCoach,parseInt(value));
            } else {
                query = `
                    SELECT id, first_name, last_name, email
                    FROM coach_applications
                    WHERE id NOT IN (
                        SELECT coach_id 
                        FROM student_applications 
                        GROUP BY coach_id 
                        HAVING COUNT(id) >= $1
                    )
                    AND status ILIKE 'verified'
                    AND ${searchParam} ILIKE $2
                `;
                values.push(maxStudentsPerCoach,`%${value}%`);
            }
            result = await pool.query(query, values);
        } else {
            query = `
                SELECT id, first_name, last_name, email
                FROM coach_applications
                WHERE id NOT IN (
                    SELECT coach_id 
                    FROM student_applications 
                    GROUP BY coach_id 
                    HAVING COUNT(id) >= $1
                )
                AND status ILIKE 'verified'
            `;
            result = await pool.query(query,[maxStudentsPerCoach]);
        }

        res.status(225).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getUnmatchedStudentLimitedDetails = async (req, res) => {
    try {
        const { searchParam, value } = req.query;
        let result;
        let query = "";
        const values = [];

        if (searchParam && value) {
            if (searchParam === "name") {
                query = `
                    SELECT id, first_name, last_name, email, status 
                    FROM student_applications
                    WHERE coach_id IS NULL
                    AND CONCAT(first_name, ' ', last_name) ILIKE $1
                `;
                values.push(`%${value}%`);
            } else if (searchParam === "id") {
                query = `
                    SELECT id, first_name, last_name, email, status 
                    FROM student_applications
                    WHERE coach_id IS NULL
                    AND id = $1
                `;
                values.push(parseInt(value));
            } else {
                query = `
                    SELECT id, first_name, last_name, email, status 
                    FROM student_applications
                    WHERE coach_id IS NULL
                    AND ${searchParam} ILIKE $1
                `;
                values.push(`%${value}%`);
            }
            result = await pool.query(query, values);
        } else {
            query = `
                SELECT id, first_name, last_name, email, status 
                FROM student_applications
                WHERE coach_id IS NULL
            `;
            result = await pool.query(query);
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