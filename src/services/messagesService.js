const { pool } = require('../config/db');

class messageService{
    constructor(userID){
        this.userID = userID;
    }

    async getMessagesForUserFromSender(senderID, reccieverID, count , page){
        try{
            const res = await pool.query('SELECT * from messages where  ((sender_id = $1 and user_id = $2) or (sender_id = $2 and user_id = $1)) order by sequence limit $2 offset $2 * $3',[userID,count,page]);
            return res.rows;
        } catch(err){
            console.error(err);
        }
    }

    async getMessageByID(messageID){
        try{
            const res = await pool.query('SELECT * from messages where id = $1',[messageID]);
            return res.rows;
        } catch(err){
            console.error(err);
        }
    }

    async insertMessage(senderID,recieverID, body){
        try{
            const res = await pool.query('insert into messages (sender_id, reciever_id, timestamp, body, sequence) values ($1, $2, now(), $3, (select max(sequence) from messages where ((sender_id = $1 and user_id = $2) or (sender_id = $2 and user_id = $1))) returning *'[senderID,recieverID, body])
            return res.rows;
        } catch(err){
            console.log(err)
        }
    }
    async editMessage(messageID, body){
        try{
            const res = await pool.query('Update messages set body = $2, timestamp = now() where id = $1',[messageID, body]);
            return res.rows;
        } catch(err){
            console.error(err);
        }
    }
    async deleteMessage(messageID){
        //deletes message and updates the following messages in the sequence reducing their sequence by 1 so it lines up
         try{
            const client = await pool.connect();
            client.query('update messages set sequence = sequence - 1 where sequence > (select sequence from messages where id = $1)',[messageID]);
            const res = await client.query('delete from messages where id = $1 returning *',[messageID]);
            client.release();
            return res.rows;
        } catch(err){
            console.error(err);
        }
    }
}