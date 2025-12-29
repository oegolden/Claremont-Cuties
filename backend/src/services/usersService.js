const { pool } = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken')
const s3 = require('../utils/s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const BUCKET = process.env.S3_BUCKET;

function parseKeyFromUrl(url) {
  try {
    const u = new URL(url);
    let pathname = decodeURIComponent(u.pathname || '');
    if (!pathname) return null;
    // remove leading /
    if (pathname.startsWith('/')) pathname = pathname.slice(1);
    // If path-style url (bucket in path) remove bucket prefix
    if (BUCKET && pathname.startsWith(`${BUCKET}/`)) {
      return pathname.slice(BUCKET.length + 1);
    }
    // otherwise the pathname is the key
    return pathname;
  } catch (e) {
    return null;
  }
}

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
      if (!user.user_photo) return null;
      // Try to parse key from stored URL so we can generate a fresh presigned URL
      const key = parseKeyFromUrl(user.user_photo);
      if (key) {
        const url = await s3.getPresignedUrl(key);
        return { key, url };
      }
      // fallback: return stored URL
      return { url: user.user_photo };
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
      const res = await pool.query('UPDATE users SET user_photo = $1 WHERE id = $2 RETURNING *', [publicUrl, userId]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async updateImage(userId, file) {
    try {
      const existing = await this.getById(userId);
      if (!existing) return null;
      if (existing.user_photo) {
        const existingKey = parseKeyFromUrl(existing.user_photo);
        if (existingKey) await s3.deleteObject(existingKey);
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
      if (!existing.user_photo) return null;
      const existingKey = parseKeyFromUrl(existing.user_photo);
      if (existingKey) await s3.deleteObject(existingKey);
      const res = await pool.query('UPDATE users SET user_photo = NULL WHERE id = $1 RETURNING *', [userId]);
      return res.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

}

module.exports = UsersService;