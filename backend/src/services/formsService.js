const { pool } = require('../config/db');

class FormsService {
  async create(formData) {
    const query = 'INSERT INTO forms (form_data) VALUES ($1) RETURNING *';
    const values = [formData];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async getById(id) {
    const res = await pool.query('SELECT * FROM forms WHERE id = $1', [id]);
    return res.rows[0];
  }
}

module.exports = FormsService;