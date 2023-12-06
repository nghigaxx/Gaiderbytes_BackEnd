const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { checkExistingStudent, createNewStudent } = require("./controllers/studentApplicationController");
const { checkExistingCoach, createNewCoach } = require("./controllers/coachApplicationController");
const { findUserByEmail, sendVerificationCode, updateUserVerificationCode, verifyCodeAndReturnStatus} = require("./controllers/checkUserStatusController");
const { adminLogin, adminSignUp, changeAdminPassword, logoutAdmin } = require('./controllers/adminController');
const { getCoachLimitedDetails, getCoachFullDetails, getStudentLimitedDetails, getStudentFullDetails} = require('./controllers/manageFetchController');
const { CheckMatchValidity, matchStudentWithCoach } = require('./controllers/manageMatchController');
const { getAvailableCoachLimitedDetails, getUnmatchedStudentLimitedDetails} = require('./controllers/fetchMatchController')
const { updateCoachStatus, updateStudentStatus, unmatchStudent } = require('./controllers/applicationStatusController');
const verifyToken = require('./middleware/verifyToken');


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


app.post('/verifyCode', verifyCodeAndReturnStatus);

app.post('/adminLogin', adminLogin);
app.post('/admin/signup', adminSignUp);
app.post('/admin/change_password', verifyToken, changeAdminPassword);
app.post('/admin/log_out', logoutAdmin)

app.get('/admin/coaches', verifyToken, getCoachLimitedDetails);
app.get('/admin/coach/:id', verifyToken, getCoachFullDetails);  
app.get('/admin/students', verifyToken, getStudentLimitedDetails);
app.get('/admin/student/:id', verifyToken, getStudentFullDetails);  
app.get('/admin/unmatched_students', verifyToken, getUnmatchedStudentLimitedDetails); 
app.get('/admin/available_coaches', verifyToken, getAvailableCoachLimitedDetails); 

app.put('/admin/match', verifyToken, async (req, res) => {
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

app.put('/admin/student/:id/status', verifyToken, updateStudentStatus);
app.put('/admin/coach/:id/status', verifyToken, updateCoachStatus);
app.put('/admin/application/:id/unmatch', verifyToken, unmatchStudent);



module.exports = app;