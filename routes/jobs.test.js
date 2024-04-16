"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", () => {
  test("ok for admin", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not allowed for users", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("should return 200 OK if the request body is valid", async () => {
    const validRequestBody = {
      // Provide a valid request body here
    };

    const response = await request(app).post("/jobs").send(validRequestBody);

    expect(response.statusCode).toBe(200);
  });

  test("should return 400 Bad Request if the request body is invalid", async () => {
    const invalidRequestBody = {
      // Provide an invalid request body here
    };

    const response = await request(app).post("/jobs").send(invalidRequestBody);

    expect(response.statusCode).toBe(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", () => {
  test("ok for anon", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[0],
          title: "j1",
          salary: 1,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: testJobIds[1],
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c2",
        },
        {
          id: testJobIds[2],
          title: "j3",
          salary: 3,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering for title search", async () => {
    const resp = await request(app).get("/jobs").query({ title: "2" });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[1],
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("works: filtering for min salary", async () => {
    const resp = await request(app).get("/jobs").query({ minSalary: 3 });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[2],
          title: "j3",
          salary: 3,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering for equity", async () => {
    const resp = await request(app).get("/jobs").query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: testJobIds[0],
          title: "j1",
          salary: 1,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: testJobIds[1],
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c2",
        },
        {
          id: testJobIds[2],
          title: "j3",
          salary: 3,
          equity: "0.3",
          companyHandle: "c3",
        },
      ],
    });

    test("works: filtering for min salary and equity", async () => {
      const resp = await request(app)
        .get("/jobs")
        .query({ minSalary: 2, hasEquity: true });
      expect(resp.body).toEqual({
        jobs: [
          {
            id: testJobIds[1],
            title: "j2",
            salary: 2,
            equity: "0.2",
            companyHandle: "c2",
          },
          {
            id: testJobIds[2],
            title: "j3",
            salary: 3,
            equity: "0.3",
            companyHandle: "c3",
          },
        ],
      });
    });

    test("should return 200 OK if the request body is valid", async () => {
      const validRequestBody = {
        // Provide a valid request body here
      };

      const response = await request(app).get("/jobs").send(validRequestBody);

      expect(response.statusCode).toBe(200);
    });

    test("should return 400 Bad Request if the request body is invalid", async () => {
      const invalidRequestBody = {
        // Provide an invalid request body here
      };

      const response = await request(app).get("/jobs").send(invalidRequestBody);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PUT /jobs/:id", () => {
    test("should return 200 OK if the request body is valid", async () => {
      const validRequestBody = {
        // Provide a valid request body here
      };

      const response = await request(app).put("/jobs/1").send(validRequestBody);

      expect(response.statusCode).toBe(200);
    });

    test("should return 400 Bad Request if the request body is invalid", async () => {
      const invalidRequestBody = {
        // Provide an invalid request body here
      };

      const response = await request(app)
        .put("/jobs/1")
        .send(invalidRequestBody);

      expect(response.statusCode).toBe(400);
    });
  });
});
