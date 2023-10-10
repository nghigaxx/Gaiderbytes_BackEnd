const request = require('supertest');
const express = require('express');
const {
    getCoachLimitedDetails,
    getCoachFullDetails,
    getStudentLimitedDetails,
    getStudentFullDetails
} = require('./controllers/manageFetchController');

const app = express();
app.use(express.json());
app.get('/admin/coaches', getCoachLimitedDetails);
app.get('/admin/coach/:id', getCoachFullDetails);
app.get('/admin/students', getStudentLimitedDetails);
app.get('/admin/student/:id', getStudentFullDetails);

// Mocking the database
jest.mock('pg');

describe('Manage Fetch Controller', () => {
    it('should fetch limited coach details', async () => {
        const res = await request(app).get('/admin/coaches');
        expect(res.statusCode).toBe(200);
    });

    it('should fetch coach details using a search parameter', async () => {
        const res = await request(app).get('/admin/coaches?searchParam=first_name&value=John');
        expect(res.statusCode).toBe(200);
    });

    it('should fetch full details for a specific coach', async () => {
        const res = await request(app).get('/admin/coach/1');
        expect(res.statusCode).toBe(255);
    });

    it('should fetch limited student details', async () => {
        const res = await request(app).get('/admin/students');
        expect(res.statusCode).toBe(215);
    });
    it('should fetch student details using a search parameter', async () => {
        const res = await request(app).get('/admin/students?searchParam=last_name&value=Smith');
        expect(res.statusCode).toBe(215);
    });

    it('should fetch full details for a specific student', async () => {
        const res = await request(app).get('/admin/student/1');
        expect(res.statusCode).toBe(265);
    });

    it('should handle invalid search parameters for students gracefully', async () => {
        const res = await request(app).get('/admin/students?searchParam=nonexistentColumn&value=test');
        expect(res.statusCode).not.toBe(500); 
    });

    it('should handle invalid search parameters for coaches gracefully', async () => {
        const res = await request(app).get('/admin/coaches?searchParam=nonexistentColumn&value=test');
        expect(res.statusCode).not.toBe(500);  
    });
});

