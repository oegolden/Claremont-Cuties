const { pool } = require('../config/db');

class MatchService {
  constructor() {
    }
    async getMatchedUsers(userId) {
        try {
                const res = await pool.query('SELECT b.* FROM matches a JOIN users b ON a.user_id_2 = b.id or a.user_id_1 = b.id WHERE b.id <> $1', [userId]);
                return res.rows;
            } catch (err) { 
                console.error(err);
                return null; 
            }
        }
    async createMatch(user1Id, user2Id) {
        try {
            const res = await pool.query('Insert into matches (user_id_1, user_id_2) VALUES ($1, $2) RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async updateMatch(user1Id, user2Id) {
        try {
            const res = await pool.query('Update matches set user_id_2 = $2 where user_id_1 = $1 RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async deleteMatch(user1Id, user2Id){
        try{
            const res = await pool.query('DELETE from matches where user_id_1 = $1 and user_id_2 = $2 RETURNING *', [user1Id, user2Id]);
            return res.rows[0];
        } catch(err){
            console.error(err);
            return null;
        }
    }
}
module.exports = MatchService;