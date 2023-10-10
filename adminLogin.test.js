const request = require('supertest');
const express = require('express');
const { adminLogin } = require('./controllers/adminController');

const app = express();
app.use(express.json());
app.post('/adminLogin', adminLogin);

describe('Admin Login', () => {
    it('should return 301 Unauthorized if no user found', async () => {
        const res = await request(app).post('/adminLogin').send({
            username: 'nonexistentuser',
            password: 'somepassword'
        });

        expect(res.statusCode).toEqual(301);
        expect(res.body.message).toEqual('Unauthorized');
    });

    it('should return 301 Unauthorized for wrong password', async () => {


        const res = await request(app).post('/adminLogin').send({
            username: 'admin',
            password: 'wrongpassword'
        });

        expect(res.statusCode).toEqual(301);
        expect(res.body.message).toEqual('Unauthorized');
    });

    it('should return 300 with token for correct credentials', async () => {

        const res = await request(app).post('/adminLogin').send({
            username: 'admin',
            password: 'Gaiderbytes2000'
        });

        expect(res.statusCode).toEqual(300);
        expect(res.body.token).toBeDefined();
    });
});
