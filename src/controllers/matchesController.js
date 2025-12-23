const matchService = require('../services/matchService');

class MatchesController {
    // List matches for a user. Expects `userId` as query param or uses authenticated user.
    async list(req, res, next) {
        try {
            const userId = req.query.userId || (req.user && req.user.id);
            if (!userId) return res.status(400).json({ error: 'userId is required' });
            const matches = await matchService.getMatchedUsers(userId);
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
            const match1 = await matchService.createMatch(user1Id, user2Id);
            const match2 = await matchService.createMatch(user2Id, user1ID);
            return res.status(201).json(match1,match2);
        } catch (err) {
            next(err);
        }
    }

    // Update a match. Uses params.user1Id and body.matchedID
    async update(req, res, next) {
        try {
            const user1Id = req.params.user1Id || req.body.user1Id;
            const matchedID = req.body.matchedID || req.params.matchedID;
            if (!user1Id || !matchedID) return res.status(400).json({ error: 'user1Id and matchedID are required' });
            const updated = await matchService.updateMatch(user1Id, matchedID);
            if (!updated) return res.status(404).json({ error: 'Match not found' });
            return res.json(updated);
        } catch (err) {
            next(err);
        }
    }

    // Delete is not implemented in matchService; return 501 Not Implemented
    async delete(req, res, next) {
        try {
            return res.status(501).json({ error: 'Delete not implemented for matches' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MatchesController;