const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  await db.query('DELETE FROM jobs');
});

afterAll(async () => {
  await db.end();
});

describe('Job Routes', () => {
  describe('POST /jobs', () => {
    test('Creates a new job', async () => {
      const response = await request(app)
        .post('/jobs')
        .send({
          title: 'Software Engineer',
          salary: 100000,
          equity: 0.1,
          companyHandle: 'google'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        job: {
          title: 'Software Engineer',
          salary: 100000,
          equity: 0.1,
          companyHandle: 'google'
        }
      });
    });

    test('Returns 400 if job title already exists', async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app)
        .post('/jobs')
        .send({
          title: 'Software Engineer',
          salary: 90000,
          equity: 0.05,
          companyHandle: 'microsoft'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: 'Duplicate job: Software Engineer'
      });
    });
  });

  describe('GET /jobs', () => {
    test('Gets a list of all jobs', async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google'),
                ('Product Manager', 90000, 0.05, 'microsoft')`
      );

      const response = await request(app).get('/jobs');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        jobs: [
          {
            title: 'Software Engineer',
            salary: 100000,
            equity: 0.1,
            companyHandle: 'google'
          },
          {
            title: 'Product Manager',
            salary: 90000,
            equity: 0.05,
            companyHandle: 'microsoft'
          }
        ]
      });
    });
  });

  describe('GET /jobs/:title', () => {
    test('Gets a single job by title', async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app).get('/jobs/Software Engineer');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        job: {
          title: 'Software Engineer',
          salary: 100000,
          equity: 0.1,
          companyHandle: 'google'
        }
      });
    });

    test('Returns 404 if job not found', async () => {
      const response = await request(app).get('/jobs/Nonexistent Job');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: 'No job: Nonexistent Job'
      });
    });
  });

  describe('PATCH /jobs/:title', () => {
    test('Updates a job', async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app)
        .patch('/jobs/Software Engineer')
        .send({
          salary: 120000,
          equity: 0.15
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        job: {
          title: 'Software Engineer',
          salary: 120000,
          equity: 0.15,
          companyHandle: 'google'
        }
      });
    });

    test('Returns 404 if job not found', async () => {
      const response = await request(app)
        .patch('/jobs/Nonexistent Job')
        .send({
          salary: 120000,
          equity: 0.15
        });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: 'No job: Nonexistent Job'
      });
    });
  });

  describe('DELETE /jobs/:title', () => {
    test('Deletes a job', async () => {
      await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
         VALUES ('Software Engineer', 100000, 0.1, 'google')`
      );

      const response = await request(app).delete('/jobs/Software Engineer');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: 'Job deleted'
      });
    });

    test('Returns 404 if job not found', async () => {
      const response = await request(app).delete('/jobs/Nonexistent Job');

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: 'No job: Nonexistent Job'
      });
    });
  });
});