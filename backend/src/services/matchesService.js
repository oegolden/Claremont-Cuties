const { pool } = require('../config/db');
const cache = require('../utils/cache');

const MATCH_CACHE_TTL = 60 * 1000; // 60s

class MatchService {
    constructor() {}

    _cacheKey(userId) {
        return `matches:${userId}`;
    }

    async getMatchedUsers(userId) {
        try {
            const key = this._cacheKey(userId);
            const cached = cache.get(key);
            if (cached) return cached;

            const res = await pool.query(
                'SELECT b.*,a.id as match_id,a.start as start FROM matches a JOIN users b ON a.user_id_2 = b.id or a.user_id_1 = b.id WHERE b.id <> $1',
                [userId]
            );
            cache.set(key, res.rows, MATCH_CACHE_TTL);
            return res.rows;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async createMatch(user1Id, user2Id) {
        try {
            const res = await pool.query(
                'Insert into matches (user_id_1, user_id_2) VALUES ($1, $2) RETURNING *',
                [user1Id, user2Id]
            );
            // invalidate cache for involved users
            cache.del(this._cacheKey(user1Id));
            cache.del(this._cacheKey(user2Id));
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async updateMatch(user1Id, user2Id) {
        try {
            const res = await pool.query(
                'Update matches set user_id_2 = $2 where user_id_1 = $1 RETURNING *',
                [user1Id, user2Id]
            );
            // invalidate caches for both users
            cache.del(this._cacheKey(user1Id));
            cache.del(this._cacheKey(user2Id));
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async setMatchStart(matchID) {
        try {
            const res = await pool.query('UPDATE matches SET start = true WHERE id = $1 RETURNING *', [matchID]);
            const row = res.rows[0];
            if (row) {
                // row should include user_id_1 and user_id_2
                cache.del(this._cacheKey(row.user_id_1));
                cache.del(this._cacheKey(row.user_id_2));
            }
            return row;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async deleteMatch(user1Id, user2Id) {
        try {
            const res = await pool.query('DELETE from matches where user_id_1 = $1 and user_id_2 = $2 RETURNING *', [user1Id, user2Id]);
            // invalidate cache for both users
            cache.del(this._cacheKey(user1Id));
            cache.del(this._cacheKey(user2Id));
            return res.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}
module.exports = MatchService;