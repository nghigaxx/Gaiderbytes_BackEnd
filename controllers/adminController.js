const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const getAdminPassword = async (username) => {
    const query = "SELECT password FROM admins WHERE username = $1";
    const result = await pool.query(query, [username]);
    
    if (result.rows.length === 0) return null;
    return result.rows[0].password;
};

const adminLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const storedHash = await getAdminPassword(username);

        if (!storedHash) {
            return res.status(301).json({ message: "Unauthorized" });
        }

        const isMatch = await bcrypt.compare(password, storedHash);
        
        if (!isMatch) {
            return res.status(301).json({ message: "Unauthorized" });
        }

        // JWT token generation
        const token = jwt.sign(
            { id: username }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(300).json({ token });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    adminLogin
};