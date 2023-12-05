const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../dbPool');
require('dotenv').config();

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

let tokenBlacklist = {};

const addToBlacklist = (token) => {
    tokenBlacklist[token] = true;
};

const isTokenBlacklisted = (token) => {
    return !!tokenBlacklist[token];
};

const createAdmin = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO admins (username, password) VALUES ($1, $2)";
    await pool.query(query, [username, hashedPassword]);
};

const adminSignUp = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please enter both username and password." });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters long, include a number and a special character." });
    }

    try {
        const adminCountQuery = "SELECT COUNT(*) FROM admins";
        const countResult = await pool.query(adminCountQuery);
        const adminCount = parseInt(countResult.rows[0].count);

        if (adminCount > 0) {
            return res.status(400).json({ message: "An admin account already exists." });
        }

        await createAdmin(username, password);
        return res.status(201).json({ message: "Admin created successfully." });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
};

const changeAdminPassword = async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: "New password must be at least 8 characters long, include a number and a special character." });
    }

    try {
        const storedHash = await getAdminPassword(username);

        if (!storedHash) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isMatch = await bcrypt.compare(currentPassword, storedHash);

        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        const query = "UPDATE admins SET password = $1 WHERE username = $2";
        await pool.query(query, [newHashedPassword, username]);

        return res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

const logoutAdmin = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    addToBlacklist(token);

    return res.status(200).json({ message: "Logged out successfully." });
};

module.exports = {
    adminLogin,
    adminSignUp,
    changeAdminPassword,
    logoutAdmin
};