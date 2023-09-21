const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { checkExistingStudent, createNewStudent } = require("./controllers/studentApplicationController");
const { checkExistingCoach, createNewCoach } = require("./controllers/coachApplicationController");
const { findUserByEmail, sendVerificationCode, updateUserVerificationCode, checkVerificationCode} = require("./controllers/checkUserStatusController");
const { adminLogin } = require('./controllers/adminController');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();


app.use(cors());
app.use(bodyParser.json());

app.post("/studentApplication", async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const existingStudent = await checkExistingStudent(first_name, last_name, email);
    if (existingStudent) {
      return res.status(400).json({ message: "Student already applied" });
    }
    const newStudent = await createNewStudent(req.body);
    res.status(201).json({ message: "Application submitted successfully", student: newStudent });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/coachApplication", upload.single("resume"), async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const existingCoach = await checkExistingCoach(first_name, last_name, email);
    if (existingCoach) {
      return res.status(400).json({ message: "Coach already applied" });
    }
    const newCoach = await createNewCoach(req.body, req.file);
    res.status(201).json({ message: "Application submitted successfully", coach: newCoach });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/checkStatus", async (req, res) => {
  try {
    const { email, userType } = req.body;
    const user = await findUserByEmail(email, userType);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(Math.random() * 899999 + 100000);
    await sendVerificationCode(email, code);
    await updateUserVerificationCode(email, userType, code);

    res.status(202).json({ message: "Verification code sent" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/verifyCode", async (req, res) => {
  try {
    const { email, userType, code } = req.body;
    const isValidCode = await checkVerificationCode(email, userType, code);

    if (!isValidCode) {
      return res.status(402).json({ message: "Invalid verification code" });
    }

    const user = await findUserByEmail(email, userType);
    res.status(203).json({ message: "Verification successful", status: user.status });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/adminLogin', adminLogin);



module.exports = app;