const { Pool } = require("pg");
const nodemailer = require("nodemailer");

jest.mock("pg");
jest.mock("nodemailer");

const mockQuery = jest.fn();
const mockPoolInstance = { query: mockQuery };
Pool.mockImplementation(() => mockPoolInstance);

const mockSendMail = jest.fn();
nodemailer.createTransport = jest.fn(() => ({
    sendMail: mockSendMail
}));

const { CheckMatchValidity, matchStudentWithCoach } = require("./controllers/manageMatchController");
const httpMocks = require("node-mocks-http");

describe("manageMatchController", () => {
    beforeEach(() => {
        mockQuery.mockClear();
        mockSendMail.mockClear();
    });

    describe("CheckMatchValidity", () => {
        it("should throw error if student is already matched", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ coach_id: 1 }] });
            await expect(CheckMatchValidity(1, 2)).rejects.toEqual({ code: 406, message: "Student already matched" });
        });

        it("should throw error if coach workload limit reached", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{}] }); 
            mockQuery.mockResolvedValueOnce({ rows: [{ count: 10 }] }); 
            await expect(CheckMatchValidity(1, 2)).rejects.toEqual({ code: 416, message: "Coach workload limit reached" });
        });

    });

    describe("matchStudentWithCoach", () => {
        it("should successfully match student with coach and send emails", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{}] }); 
            mockQuery.mockResolvedValueOnce({ rows: [{ count: 5 }] });
            mockQuery.mockResolvedValueOnce({});
            mockQuery.mockResolvedValueOnce({ rows: [{ first_name: "John", last_name: "Doe", email: "john.doe@example.com" }] }); // Student details
            mockQuery.mockResolvedValueOnce({ rows: [{ first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com" }] }); // Coach details

            await matchStudentWithCoach(1, 2);

            expect(mockSendMail).toHaveBeenCalledTimes(2);
            expect(mockSendMail.mock.calls[0][0].to).toBe("john.doe@example.com");
            expect(mockSendMail.mock.calls[1][0].to).toBe("jane.smith@example.com");
        });

    });
});