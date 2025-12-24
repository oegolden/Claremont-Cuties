const MessagesService = require('../services/messagesService');

class MessagesController {
  constructor() {
    this.service = new MessagesService();
  }

  // GET /messages/conversation?senderID=...&receiverID=...&count=...&page=...
  async listConversation(req, res, next) {
    try {
      const senderID = req.query.senderID;
      const receiverID = req.query.receiverID;
      const count = parseInt(req.query.count, 10) || 50;
      const page = parseInt(req.query.page, 10) || 0;

      if (!senderID || !receiverID) return res.status(400).json({ error: 'senderID and receiverID are required' });

      const messages = await this.service.getMessagesForUserFromSender(senderID, receiverID, count, page);
      return res.json(messages);
    } catch (err) {
      next(err);
    }
  }

  // GET /messages/:id
  async get(req, res, next) {
    try {
      const messageID = req.params.id;
      const message = await this.service.getMessageByID(messageID);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      return res.json(message);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { senderID, receiverID, body } = req.body;
      if (!senderID || !receiverID || !body) return res.status(400).json({ error: 'senderID, receiverID and body are required' });
      const inserted = await this.service.insertMessage(senderID, receiverID, body);
      return res.status(201).json(inserted);
    } catch (err) {
      next(err);
    }
  }

  // PUT /messages/:id
  async update(req, res, next) {
    try {
      const messageID = req.params.id;
      const { body } = req.body;
      if (!body) return res.status(400).json({ error: 'body is required' });
      const updated = await this.service.editMessage(messageID, body);
      if (!updated) return res.status(404).json({ error: 'Message not found' });
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /messages/:id
  async remove(req, res, next) {
    try {
      const messageID = req.params.id;
      const deleted = await this.service.deleteMessage(messageID);
      if (!deleted) return res.status(404).json({ error: 'Message not found' });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MessagesController;
