const request = require('supertest');
const app = require('./app');

describe('Admin Matchmaking', () => {

    it('should successfully match a student with a coach', async () => {
        const studentId = '1';
        const coachId = '1';

        const res = await request(app)
            .put('/admin/match')
            .send({ studentId, coachId });

        expect(res.statusCode).toEqual(206);
        expect(res.body.message).toEqual('Student and Coach successfully matched!');
    });

    it('should fail if student is already matched', async () => {
        // Replace with studentId that is already matched
        const studentId = 'alreadyMatchedStudentId';
        const coachId = 'validCoachId';

        const res = await request(app)
            .put('/admin/match')
            .send({ studentId, coachId });

        expect(res.statusCode).toEqual(406);
        expect(res.body.message).toEqual('The selected student is already matched with a coach.');
    });

    it('should fail if coach has already reached workload limit', async () => {
        // Replace with coachId that already has 10 students
        const studentId = 'validStudentId';
        const coachId = 'overloadedCoachId';

        const res = await request(app)
            .put('/admin/match')
            .send({ studentId, coachId });

        expect(res.statusCode).toEqual(416);
        expect(res.body.message).toEqual('The selected coach has already reached their workload limit.');
    });

});
