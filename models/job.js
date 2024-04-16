"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [data.title, data.salary, data.equity, data.companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Can filter on provided search filters:
   * - title (will find case-insensitive, partial matches)
   * - minSalary
   * - hasEquity (if true, find jobs that provide a non-zero amount of equity)
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll({ title, minSalary, hasEquity } = {}) {
    const query = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle AS "companyHandle",
                          c.name AS "companyName"
                   FROM jobs j
                   LEFT JOIN companies AS c ON j.company_handle = c.handle`;
    let whereExpressions = [];
    let queryValues = [];

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *  where companyHandle is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   *
   * */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE handle = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
      `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [job.companyHandle]
    );

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   *
   *
   * */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });

    const titleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                        SET ${setCols}
                        WHERE title = ${titleVarIdx}
                        RETURNING title,
                                  salary,
                                  equity,
                                  company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(title) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE title = $1
              RETURNING title`,
      [title]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}

module.exports = Job;
