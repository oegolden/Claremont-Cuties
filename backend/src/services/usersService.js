const { pool } = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')
const s3 = require('../utils/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const BUCKET = process.env.S3_BUCKET;

// We now store the S3 object key in `user_photo_key` column.

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
        [name, email, age, home_location, campus, year, social_media_accounts, gender, sexual_orientation , form_id, id]
      );
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async setFormId(userId, formId) {
    try {
      const res = await pool.query(
        'UPDATE users SET form_id = $2 WHERE id = $1 RETURNING *',
        [userId, formId]
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

  // Image operations
  async getImage(userId) {
    try {
      const user = await this.getById(userId);
      if (!user) return null;
      if (!user.user_photo_key) return null;
      const url = await s3.getPresignedUrl(user.user_photo_key);
      return { key: user.user_photo_key, url };
    } catch (err) {
      console.error(err);
    }
  }

  async createImage(userId, file) {
    try {
      const ext = path.extname(file.originalname) || '';
      const key = `users/${userId}/${uuidv4()}${ext}`;
      await s3.uploadObject(key, file.buffer, file.mimetype);
      const publicUrl = await s3.getPresignedUrl(key);
      const res = await pool.query('UPDATE users SET user_photo_key = $1 WHERE id = $2 RETURNING *', [key, userId]);
      // Attach the presigned URL for immediate use but persist only the key
      if (res && res.rows && res.rows[0]) res.rows[0].user_photo = publicUrl;
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async updateImage(userId, file) {
    try {
      const existing = await this.getById(userId);
      if (!existing) return null;
      if (existing.user_photo_key) {
        await s3.deleteObject(existing.user_photo_key);
      }
      return await this.createImage(userId, file);
    } catch (err) {
      console.error(err);
    }
  }

  async deleteImage(userId) {
    try {
      const existing = await this.getById(userId);
      if (!existing) return null;
      if (!existing.user_photo_key) return null;
      const existingKey = existing.user_photo_key;
      if (existingKey) await s3.deleteObject(existingKey);
      const res = await pool.query('UPDATE users SET user_photo_key = NULL WHERE id = $1 RETURNING *', [userId]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

}

module.exports = UsersService;