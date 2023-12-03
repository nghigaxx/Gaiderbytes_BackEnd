const pool = require('../dbPool');
require('dotenv').config();

const updateCoachStatus = async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ["pending", "verified"];
    const tableName = "coach_applications";
    
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const updateQuery = `UPDATE ${tableName} SET status = $1 WHERE id = $2`;

    try {
        await pool.query(updateQuery, [newStatus, id]);
        res.status(200).json({ message: "Coach status updated successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const updateStudentStatus = async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ["pending", "matched", "graduated"];
    const tableName = "student_applications";
    
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    let updateQuery = newStatus === "graduated"
        ? `UPDATE ${tableName} SET status = $1, coach_id = NULL WHERE id = $2`
        : `UPDATE ${tableName} SET status = $1 WHERE id = $2`;

    try {
        await pool.query(updateQuery, [newStatus, id]);
        res.status(200).json({ message: "Student status updated successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const unmatchStudent = async (req, res) => {
    const { id } = req.params; 

    try {
        const result = await pool.query(
            `UPDATE student_applications SET coach_id = NULL, status = 'pending' WHERE id = $1 RETURNING *`, 
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Student not found or not matched" });
        }

        res.status(200).json({ message: "Student unmatched successfully", student: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    updateCoachStatus,
    updateStudentStatus,
    unmatchStudent
};