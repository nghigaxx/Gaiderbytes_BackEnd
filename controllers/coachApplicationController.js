require('dotenv').config();

const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const Dropbox = require("dropbox").Dropbox;
const fetch = require("node-fetch");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch,
});

const checkExistingCoach = async (first_name, last_name, email) => {
  const result = await pool.query(
    "SELECT * FROM coach_applications WHERE first_name = $1 AND last_name = $2 AND email = $3",
    [first_name, last_name, email]
  );
  return result.rows.length > 0;
};

const uploadResumeToDropbox = async (file) => {
    const result = await dbx.filesUpload({
      path: `/Apps/Canadian Higher Ed Coaches Test/resumes/${file.originalname}`,
      contents: file.buffer,
    });
    const link = await dbx.sharingCreateSharedLinkWithSettings({
      path: result.path_lower,
    });
    return link.url;
  };

const createNewCoach = async (data, resumeFile) => {
  const {
    first_name,
    last_name,
    email,
    province,
    city,
    address,
    postal_code,
    date_of_birth,
    pronoun,
    years_of_experience,
    self_identification,
    gen_status,
    languages,
    institutions,
    availability,
    introduction,
    reside_in_canada,
    post_secondary_exp,
  } = data;

  const resume_url = await uploadResumeToDropbox(resumeFile);

  const result = await pool.query(
    "INSERT INTO coach_applications (first_name, last_name, email, province, city, address, postal_code, date_of_birth, pronoun, years_of_experience, resume_url, self_identification, gen_status, languages, institutions, availability, introduction, reside_in_canada, post_secondary_exp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *",
    [
      first_name,
      last_name,
      email,
      province,
      city,
      address,
      postal_code,
      date_of_birth,
      pronoun,
      years_of_experience,
      resume_url,
      self_identification,
      gen_status,
      languages,
      institutions,
      availability,
      introduction,
      reside_in_canada,
      post_secondary_exp,
    ]
  );

  const mailOptions = {
    from: "canadiancoachestest@gmail.com",
    to: email,
    subject: "Application Submitted Successfully",
    text: "Thank you " + first_name + " " + last_name +' for submitting your application to Canadian Higher Ed Coaches. Your status is "pending"',
};

transporter.sendMail(mailOptions, function (error, info) {
if (error) {
console.error(error.message);
} else {
console.log("Email sent: " + info.response);
}
});

return result.rows[0];
};

module.exports = {
checkExistingCoach,
createNewCoach,
};