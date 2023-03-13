const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { checkExistingStudent, createNewStudent } = require("./controllers/studentApplicationController");

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

app.listen(5000, () => {
  console.log("Server started on port 5000");
});