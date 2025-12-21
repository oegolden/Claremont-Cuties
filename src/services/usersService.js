const { pool } = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')

class UsersService {
  constructor() {
  }

  async list() {
    try {
      const res = await pool.query('SELECT * FROM users');
      return res.rows;
    } catch (err) {
      console.error(err);
    }
  }

  async getById(id) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async create(data) {
    try {
      const { name, password, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id} = data;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const res = await pool.query(
        'INSERT INTO users (name, password, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [name, hashedPassword, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id]
      );
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async update(id, data) {
    try {
      const { name, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id} = data;
      const res = await pool.query(
        'UPDATE users SET name = $1, email = $2, age = $3, home_location = $4, campus = $5, year = $6, social_media_accounts = $7, gender = $8, sexual_orientation = $9, form_id = $10 WHERE id = $11 RETURNING *',
        [name, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id]
      );
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async remove(id) {
    try {
      const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }
  
  async getByEmail(email) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

}

module.exports = UsersService;