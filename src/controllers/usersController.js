const UsersService = require('../services/usersService');

class UsersController {
  constructor() {
    this.service = new UsersService();
    // bind methods if you prefer not to bind in routes
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async list(req, res, next) {
    try {
      const users = await this.service.list();
      res.json(users);
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

  async create(req, res, next) {
    try {
      const user = await this.service.create(req.body);
      res.status(201).json(user);
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

  async delete(req, res, next) {
    try {
      const ok = await this.service.remove(req.params.id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UsersController;