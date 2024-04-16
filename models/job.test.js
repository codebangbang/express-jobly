"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************* find all jobs ************************
 */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "j2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });

  test("works: with title filter", async function () {
    let jobs = await Job.findAll({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: with minSalary filter", async function () {
    let jobs = await Job.findAll({ minSalary: 250 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });

  test("works: with hasEquity filter", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "j2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: testJobIds[2],
        title: "j3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });

  test("works: with all filters", async function () {
    let jobs = await Job.findAll({
      title: "j1",
      minSalary: 50,
      hasEquity: true,
    });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});

/************************* create job ************************/

describe("Job Routes", () => {
  describe("POST /jobs", () => {
    test("Creates a new job", async () => {
      const response = await request(app).post("/jobs").send({
        title: "Software Engineer",
        salary: 100000,
        equity: 0.1,
        companyHandle: "google",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        job: {
          title: "Software Engineer",
          salary: 100000,
          equity: 0.1,
          companyHandle: "google",
        },
      });
    });

    test("Returns 400 if job title already exists", async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app).post("/jobs").send({
        title: "Software Engineer",
        salary: 90000,
        equity: 0.05,
        companyHandle: "microsoft",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Duplicate job: Software Engineer",
      });
    });
  });

  /************************* get all jobs ************************/

  describe("GET /jobs", () => {
    test("Gets a list of all jobs", async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google'),
                ('Product Manager', 90000, 0.05, 'microsoft')`
      );

      const response = await request(app).get("/jobs");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        jobs: [
          {
            title: "Software Engineer",
            salary: 100000,
            equity: 0.1,
            companyHandle: "google",
          },
          {
            title: "Product Manager",
            salary: 90000,
            equity: 0.05,
            companyHandle: "microsoft",
          },
        ],
      });
    });
  });

  /************************* get job by title ************************/

  describe("GET /jobs/:title", () => {
    test("Gets a single job by title", async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app).get("/jobs/Software Engineer");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        job: {
          title: "Software Engineer",
          salary: 100000,
          equity: 0.1,
          companyHandle: "google",
        },
      });
    });

    test("Returns 404 if job not found", async () => {
      const response = await request(app).get("/jobs/Nonexistent Job");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "No job: Nonexistent Job",
      });
    });
  });

  /************************* update job ************************/

  describe("PATCH /jobs/:title", () => {
    test("Updates a job", async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app)
        .patch("/jobs/Software Engineer")
        .send({
          salary: 120000,
          equity: 0.15,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        job: {
          title: "Software Engineer",
          salary: 120000,
          equity: 0.15,
          companyHandle: "google",
        },
      });
    });

    test("Returns 404 if job not found", async () => {
      const response = await request(app).patch("/jobs/Nonexistent Job").send({
        salary: 120000,
        equity: 0.15,
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "No job: Nonexistent Job",
      });
    });
  });

  /************************* delete job ************************/
  describe("DELETE /jobs/:title", () => {
    test("Deletes a job", async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app).delete("/jobs/Software Engineer");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: "Job deleted",
      });
    });

    test("Returns 404 if job not found", async () => {
      const response = await request(app).delete("/jobs/Nonexistent Job");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "No job: Nonexistent Job",
      });
    });
  });
});
