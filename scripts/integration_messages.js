const { newDb } = require('pg-mem');
const MessagesService = require('../src/services/messagesService');

(async () => {
  const db = newDb();
  const pg = db.adapters.createPg();
  const pool = new pg.Pool();

  // create schema
  await pool.query(`
    CREATE TABLE messages (
      id serial PRIMARY KEY,
      sender_id integer NOT NULL,
      reciever_id integer NOT NULL,
      timestamp timestamptz DEFAULT now(),
      body text,
      sequence integer DEFAULT 1
    );
  `);

  // seed some data
  await pool.query("INSERT INTO messages (sender_id, reciever_id, body, sequence) VALUES (1,2,'Hi there',1),(2,1,'Hello back',2);");

  const service = new MessagesService(pool);

  console.log('\n-- fetch conversation --');
  const conv = await service.getMessagesForUserFromSender(1, 2, 10, 0);
  console.log(conv);

  console.log('\n-- insert message --');
  const inserted = await service.insertMessage(1, 2, 'A new message');
  console.log(inserted);

  console.log('\n-- get by id --');
  const got = await service.getMessageByID(inserted.id);
  console.log(got);

  console.log('\n-- edit message --');
  const edited = await service.editMessage(inserted.id, 'Edited text');
  console.log(edited);

  console.log('\n-- delete message --');
  const deleted = await service.deleteMessage(2);
  const conv2 = await service.getMessagesForUserFromSender(1, 2, 10, 0);
  console.log(conv2);


  await pool.end();
})();
