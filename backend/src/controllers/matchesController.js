const MatchService = require('../services/matchesService');

class MatchesController {
    constructor() {
        this.service = new MatchService();
    }
    // List matches for a user. Expects `userId` as query param or uses authenticated user.
    async list(req, res, next) {
        try {
            const userId = req.params.userId || req.query.userId || (req.user && req.user.id);
            if (!userId) return res.status(400).json({ error: 'userId is required' });
            const matches = await this.service.getMatchedUsers(userId);
            return res.json(matches);
        } catch (err) {
            next(err);
        }
    }

    // Create a match between two users. Expects { user1Id, user2Id } in body.
    async create(req, res, next) {
        try {
            const { user1Id, user2Id } = req.body;
            if (!user1Id || !user2Id) return res.status(400).json({ error: 'user1Id and user2Id are required' });
            const match1 = await this.service.createMatch(user1Id, user2Id);
            const match2 = await this.service.createMatch(user2Id, user1Id);
            return res.status(201).json([match1, match2]);
        } catch (err) {
            next(err);
        }
    }

    // Update a match. Uses params.user1Id and body.matchedID
    async update(req, res, next) {
        try {
            const user1Id = req.params.user1Id || req.body.user1Id;
            const matchedID = req.body.user2Id || req.params.user2Id;
            if (!user1Id || !user2Id) return res.status(400).json({ error: 'user1Id and matchedID are required' });
            const updated = await this.service.updateMatch(user1Id, user2Id);
            if (!updated) return res.status(404).json({ error: 'Match not found' });
            return res.json(updated);
        } catch (err) {
            next(err);
        }
    }

    // Delete is not implemented in matchService; return 501 Not Implemented
    async delete(req, res, next) {
        try {
            const user1_id = req.params.user1Id
            const user2_id = req.params.user2Id
            const deleted = await this.service.deleteMatch(user1Id,user2Id);
            return res.json(deleted)
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MatchesController;