const UsersService = require('../services/usersService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UsersController {
  constructor() {
    this.service = new UsersService();
  }

  async list(req, res, next) {
    try {
      const users = await this.service.list();
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async get(req, res, next) {
    try {
      const user = await this.service.getById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  // GET /users/:id/image
  async getImage(req, res, next) {
    try {
      const image = await this.service.getImage(req.params.id);
      if (!image) return res.status(404).json({ error: 'Image not found' });
      return res.json(image);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const user = await this.service.create(req.body);
      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  // POST /users/:id/image
  async createImage(req, res, next) {
    try {
      console.log('UsersController.createImage called for user:', req.params.id);
      const file = req.file;
      console.log('File received:', file ? file.originalname : 'No file');
      if (!file) return res.status(400).json({ error: 'Image file is required' });
      const updated = await this.service.createImage(req.params.id, file);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      return res.status(201).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await this.service.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // PUT /users/:id/image
  async updateImage(req, res, next) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'Image file is required' });
      const updated = await this.service.updateImage(req.params.id, file);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const ok = await this.service.remove(req.params.id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // DELETE /users/:id/image
  async deleteImage(req, res, next) {
    try {
      const deleted = await this.service.deleteImage(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'User or image not found' });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await this.service.getByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign(
          user,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' }
        )
        res.status(200).json({ accessToken: accessToken, user: user });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = UsersController;