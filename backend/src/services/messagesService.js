class MessagesService {
    constructor(pool) {
        // allow passing a custom pool for testing (pg-mem) or use configured pool
        this.pool = pool || require('../config/db').pool;
    }

    async getMessagesForUserFromSender(senderID, receiverID, count, page) {
        try {
            const limit = count;
            const offset = page * limit;
            const res = await this.pool.query(
                'SELECT * FROM messages WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)) ORDER BY sequence LIMIT $3 OFFSET $4',
                [senderID, receiverID, limit, offset]
            );
            return res.rows;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getMessageByID(messageID) {
        try {
            const res = await this.pool.query('SELECT * FROM messages WHERE id = $1', [messageID]);
            return res.rows[0] || null;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
       
    async insertMessage(senderID, receiverID, body) {
        try {
            const res = await this.pool.query(
                `INSERT INTO messages (sender_id, receiver_id, timestamp, body, sequence)
                 VALUES ($1, $2, now(), $3, COALESCE((SELECT max(sequence) FROM messages WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))), 0) + 1)
                 RETURNING *`,
                [senderID, receiverID, body]
            );
            return res.rows[0];
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async editMessage(messageID, body) {
        try {
            const res = await this.pool.query('UPDATE messages SET body = $2, timestamp = now() WHERE id = $1 RETURNING *', [messageID, body]);
            return res.rows[0] || null;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async deleteMessage(messageID) {
        try {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
                await client.query('UPDATE messages SET sequence = sequence - 1 WHERE sequence > (SELECT sequence FROM messages WHERE id = $1)', [messageID]);
                const res = await client.query('DELETE FROM messages WHERE id = $1 RETURNING *', [messageID]);
                await client.query('COMMIT');
                return res.rows[0] || null;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

module.exports = MessagesService;