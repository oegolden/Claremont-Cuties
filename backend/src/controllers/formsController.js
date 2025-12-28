const FormsService = require('../services/formsService');
const UsersService = require('../services/usersService');

class FormsController {
  constructor() {
    this.service = new FormsService();
    this.usersService = new UsersService();
  }

  async create(req, res) {
    try {
      const userId = (req.user && req.user.id) || req.body.userId;
      const formData = req.body.form_data || req.body.formData;

      if (!userId) {
        return res.status(400).json({ error: 'Missing user id' });
      }
      if (!formData) {
        return res.status(400).json({ error: 'Missing form_data' });
      }

      const created = await this.service.create(formData);
      if (userId) {
        await this.usersService.setFormId(userId, created.id);
      }
      return res.status(201).json({ form: created });
    } catch (err) {
      console.error('Error creating form:', err);
      return res.status(500).json({ error: 'Failed to save form data' });
    }
  }
}

module.exports = FormsController;