const { pool } = require('../config/db');

class MatchService {
  constructor() {
    }
    async getMatchedUsers(userId) {
        try {
                const res = await pool.query('SELECT b.* FROM matches a JOIN users b ON a.user2_id = b.id WHERE a.user1_id = $1', [userId]);
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
    async updateMatch(user1Id, user2Id) {
        try {
            const res = await pool.query('Update matches set user2_id = $2 where user1_id = $1 RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async deleteMatch(user1Id, user2Id){
        try{
            const res = await pool.query('DELETE from matches where user1_id = $1 and user2_id = user$2 RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch(err){
            consoler.error(err);
            return null;
        }
    }
}
module.exports = MatchService;