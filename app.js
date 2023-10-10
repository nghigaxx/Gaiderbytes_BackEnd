const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { checkExistingStudent, createNewStudent } = require("./controllers/studentApplicationController");
const { checkExistingCoach, createNewCoach } = require("./controllers/coachApplicationController");
const { findUserByEmail, sendVerificationCode, updateUserVerificationCode, checkVerificationCode} = require("./controllers/checkUserStatusController");
const { adminLogin } = require('./controllers/adminController');
const { getCoachLimitedDetails, getCoachFullDetails, getStudentLimitedDetails, getStudentFullDetails} = require('./controllers/manageFetchController');
const { CheckMatchValidity, matchStudentWithCoach } = require('./controllers/manageMatchController');
const { getAvailableCoachLimitedDetails, getUnmatchedStudentLimitedDetails} = require('./controllers/fetchMatchController')
const { updateApplicationStatus } = require('./controllers/applicationStatusController');


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

app.get('/admin/coaches', getCoachLimitedDetails);
app.get('/admin/coach/:id', getCoachFullDetails);  // Get full details for a specific coach using their ID
app.get('/admin/students', getStudentLimitedDetails);
app.get('/admin/student/:id', getStudentFullDetails);  // Get full details for a specific student using their ID
app.get('/admin/unmatched_students', getUnmatchedStudentLimitedDetails); // Get list of unmatched students, only use for matching page
app.get('/admin/available_coaches', getAvailableCoachLimitedDetails); // Get list of available coaches, only use for matching page

app.put('/admin/match', async (req, res) => {
  try {
      const { studentId, coachId } = req.body; 

      const validity = await CheckMatchValidity(studentId, coachId);

      if (validity === 'student-already-matched') {
          return res.status(406).json({ message: "The selected student is already matched with a coach." });
      } else if (validity === 'coach-limit-exceeded') {
          return res.status(416).json({ message: "The selected coach has already reached their workload limit." });
      }

      await matchStudentWithCoach(studentId, coachId);

      res.status(206).json({ message: "Student and Coach successfully matched!" });

  } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
  }
});

app.put('/admin/application/:id/status', updateApplicationStatus);




module.exports = app;