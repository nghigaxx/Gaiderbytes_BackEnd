const { Pool } = require("pg");
jest.mock("pg");

const mockQuery = jest.fn();
const mockPoolInstance = { query: mockQuery };
Pool.mockImplementation(() => mockPoolInstance);

const { getCoachFullDetails, getCoachLimitedDetails, getStudentFullDetails, getStudentLimitedDetails } = require("./controllers/manageFetchController");
const httpMocks = require("node-mocks-http");

describe("manageFetchController", () => {
    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe("getCoachFullDetails", () => {
        it("should return coach full details for a given ID", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/admin/coach/1",
                params: {
                    id: "1",
                },
            });

            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{ id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", province: "Ontario", city: "Toronto", address:"123 random street", postal_code:"N9B2H5", date_of_birth:"1985-05-20", pronoun:"He/Him", years_of_experience:"5", resume_url:"https://test.cc/", self_identification:"black", gen_status:"1st gen", languages:"English, French", institutions:"UofT", availability:"3 semesters", introduction:"Hi", reside_in_canada:true, post_secondary_exp: true, status: "verified", post_secondary_program: "Software Engineering", verification_code: 123456 }],
            };

            mockQuery.mockResolvedValueOnce(mockData);

            await getCoachFullDetails(mockRequest, mockResponse);
            
            expect(mockResponse.statusCode).toBe(255);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows[0]);
        });
    });

    describe("getCoachLimitedDetails", () => {
        it("should return limited coach details", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/admin/coaches",
                query: {},
            });

            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{ id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", status: "verified" }]
            };

            mockQuery.mockResolvedValueOnce(mockData);

            await getCoachLimitedDetails(mockRequest, mockResponse);
            
            expect(mockResponse.statusCode).toBe(200);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows);
        });
    });

    describe("getStudentLimitedDetails", () => {
        it("should return limited student details", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/admin/students",
                query: {},
            });
    
            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{ id: 1, 
                    first_name: 'Student',
                    last_name: '1',
                    email: 'student.1@example.com',
                    status: 'matched'}],
            };
    
            mockQuery.mockResolvedValueOnce(mockData);
    
            await getStudentLimitedDetails(mockRequest, mockResponse);
    
            expect(mockResponse.statusCode).toBe(215);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows);
        });
    
    });
    
    describe("getStudentFullDetails", () => {
        it("should return student full details for a given ID", async () => {
            const mockRequest = httpMocks.createRequest({
                method: "GET",
                url: "/admin/student/1",
                params: {
                    id: "1",
                },
            });
    
            const mockResponse = httpMocks.createResponse();
            const mockData = {
                rows: [{ id: 1, 
                    first_name: 'Student',
                    last_name: '1',
                    email: 'student.1@example.com',
                    province: 'Ontario',
                    city: 'Toronto',
                    address: '456 King St',
                    postal_code: 'M5V2K5',
                    date_of_birth: '2000-10-10',
                    pronoun: 'She/Her',
                    institution_name: 'University of Toronto',
                    program_name: 'Computer Science',
                    emergency_contact_first_name: 'John',
                    emergency_contact_last_name: 'Doe',
                    emergency_contact_phone: '416-555-1234',
                    emergency_contact_relation: 'Father',
                    status: 'matched',
                    verification_code: 654321,
                    coach_id: 1 }],
            };
    
            mockQuery.mockResolvedValueOnce(mockData);
    
            await getStudentFullDetails(mockRequest, mockResponse);
    
            expect(mockResponse.statusCode).toBe(265);
            expect(mockResponse._getJSONData()).toEqual(mockData.rows[0]);
        });
    });
});