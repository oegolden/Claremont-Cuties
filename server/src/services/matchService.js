const { pool } = require('../config/db');

class MatchService {
  constructor() {
    }
    async getMatchedUsers(userId) {
        try {
                const res = await pool.query('Select b.* from matches a join users b on a.user2_id = b.user2_id where user1_id = $1', [userId]);
                return res.rows;
            } catch (err) { 
                console.error(err);
                return null; 
            }
        }
    async createMatch(user1Id, user2Id) {
        try {
            const res = await pool.query('Insert into matches (user1_id, user2_id) VALUES ($1, $2) RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async updateMatch(userID, matchedID) {
        try {
            const res = await pool.query('Update matches set user2_id = $2 where user1_id = $1 RETURNING *', [userID, matchedID]);
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}