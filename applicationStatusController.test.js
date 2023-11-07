const { updateCoachStatus, updateStudentStatus, unmatchStudent } = require('./controllers/applicationStatusController');
const pool = require('./dbPool');
const { mockRequest, mockResponse } = require('jest-mock-req-res');

jest.mock('./dbPool', () => ({
  query: jest.fn()
}));

describe('Controller Functions', () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCoachStatus', () => {
    it('updates coach status successfully', async () => {
      req.params.id = '1';
      req.body.newStatus = 'verified';
      pool.query.mockResolvedValue({ rowCount: 1 });

      await updateCoachStatus(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE coach_applications SET status = $1 WHERE id = $2`,
        ['verified', '1']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Coach status updated successfully" });
    });

  });

  describe('updateStudentStatus', () => {
    it('updates student status successfully', async () => {
      req.params.id = '2';
      req.body.newStatus = 'graduated';
      pool.query.mockResolvedValue({ rowCount: 1 });

      await updateStudentStatus(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE student_applications SET status = $1, coach_id = NULL WHERE id = $2`,
        ['graduated', '2']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Student status updated successfully" });
    });

  });

  describe('unmatchStudent', () => {
    it('unmatches student successfully', async () => {
      req.params.id = '3';
      pool.query.mockResolvedValue({ rowCount: 1, rows: [{ id: '3', coach_id: null }] });

      await unmatchStudent(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        `UPDATE student_applications SET coach_id = NULL WHERE id = $1 RETURNING *`,
        ['3']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Student unmatched successfully",
        student: { id: '3', coach_id: null }
      });
    });

    it('returns 404 when no student is found to unmatch', async () => {
      req.params.id = '99';
      pool.query.mockResolvedValue({ rowCount: 0 });

      await unmatchStudent(req, res);

      expect(pool.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Student not found or not matched" });
    });

  });
});