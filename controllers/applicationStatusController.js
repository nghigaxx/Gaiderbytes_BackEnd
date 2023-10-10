const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const updateApplicationStatus = async (req, res) => {
    const { id } = req.params;  // Assuming ID is passed as a parameter in the URL
    const { applicationType, newStatus } = req.body;

    let validStatuses = [];
    let tableName = '';

    // Define valid statuses and table names for each application type
    if (applicationType === 'student') {
        validStatuses = ["pending", "matched", "graduated"];
        tableName = "student_applications";
    } else if (applicationType === 'coach') {
        validStatuses = ["pending", "verified"];
        tableName = "coach_applications";
    } else {
        return res.status(408).json({ message: "Invalid application type" });
    }

    if (!validStatuses.includes(newStatus)) {
        return res.status(408).json({ message: "Invalid status value" });
    }

    try {
        await pool.query(`UPDATE ${tableName} SET status = $1 WHERE id = $2`, [newStatus, id]);
        res.status(208).json({ message: "Status updated successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    updateApplicationStatus
};