const { Pool } = require("pg");
jest.mock("pg");

const mockQuery = jest.fn();
const mockPoolInstance = { query: mockQuery };
Pool.mockImplementation(() => mockPoolInstance);

const { getAvailableCoachLimitedDetails, getUnmatchedStudentLimitedDetails } = require("./controllers/fetchMatchController");
const httpMocks = require("node-mocks-http");

describe("fetchMatchController", () => {
    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe("getAvailableCoachLimitedDetails", () => {
        it("should return available coaches with limited details", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/available_coaches",
                query: {},
            });

            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{ id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", status: "verified"}],
            };

            mockQuery.mockResolvedValueOnce(mockData);

            await getAvailableCoachLimitedDetails(mockRequest, mockResponse);

            expect(mockResponse.statusCode).toBe(225);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows);
        });
    });

    describe("getUnmatchedStudentLimitedDetails", () => {
        it("should return unmatched students with limited details", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/unmatched_students",
                query: {},
            });

            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{  id: 1, first_name: "Jane", last_name: "Doe", email: "jane.doe@example.com", status: "matched" }],
            };

            mockQuery.mockResolvedValueOnce(mockData);

            await getUnmatchedStudentLimitedDetails(mockRequest, mockResponse);

            expect(mockResponse.statusCode).toBe(235);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows);
        });
    });
});