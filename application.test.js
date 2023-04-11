const fs = require('fs');
const path = require('path');
const axios = require('axios');
const request = require('supertest');
const app = require('./app');

const downloadResume = async () => {
  const url = process.env.TEST_RESUME_URL;
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  const tempPath = path.join(__dirname, 'temp-resume.pdf');
  fs.writeFileSync(tempPath, Buffer.from(response.data));

  return tempPath;
};

describe('Student Application', () => {
  test('successfully submits student application', async () => {
    const studentData = 
      {
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@example.com",
        "province": "Ontario",
        "city": "Toronto",
        "address": "123 Example Street",
        "postal_code": "A1B2C3",
        "date_of_birth": "2000-01-01",
        "pronoun": "He/Him",
        "institution_name": "University of Toronto",
        "program_name": "Computer Science",
        "emergency_contact_first_name": "Jane",
        "emergency_contact_last_name": "Doe",
        "emergency_contact_phone": "555-555-5555",
        "emergency_contact_relation": "Mother"
      };


    const response = await request(app)
      .post('/studentApplication')
      .send(studentData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Application submitted successfully');
  });

  test('fails to submit student application due to duplicate', async () => {
    const studentData = {
      // Add student data that already exists here
    };

    const response = await request(app)
      .post('/studentApplication')
      .send(studentData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Student already applied');
  });
});

describe('Coach Application', () => {
  
  beforeAll(async () => {
    resumeFile = await downloadResume();
  });

  afterAll(() => {
    fs.unlinkSync(resumeFile);
  });

  test('successfully submits coach application', async () => {
    const coachData = 
      {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alicesmith@example.com",
        "province": "British Columbia",
        "city": "Vancouver",
        "address": "456 Example Street",
        "postal_code": "X1Y2Z3",
        "date_of_birth": "1985-06-15",
        "pronoun": "She/Her",
        "years_of_experience": 5,
        "self_identification": "Indigenous",
        "gen_status": "Second Gen",
        "languages": "English, French",
        "institutions": "University of British Columbia",
        "availability": "Monday, Wednesday, Friday",
        "introduction": "I am an experienced coach with a passion for helping students.",
        "reside_in_canada": true,
        "post_secondary_exp": true,
        "post_secondary_program": "Masters in Education"
      };

    const response = await request(app)
      .post('/coachApplication')
      .attach('resume', resumeFile)
      .field('data', JSON.stringify(coachData));

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Application submitted successfully');
  });

  test('fails to submit coach application due to duplicate', async () => {
    const coachData = {
      // Add coach data that already exists here
    };

    const response = await request(app)
      .post('/coachApplication')
      .attach('resume', resumeFile)
      .field('data', JSON.stringify(coachData));

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Coach already applied');
  });
});