const cron = require('node-cron');
const { pool } = require('../config/db');
const matchingAlgorithm = require('../services/matchingAlgorithm');
const MatchService = require('../services/matchesService');

const matchService = new MatchService();

// Schedule the task to run every Sunday at midnight
const weeklyMatchJob = cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly matching job...');
    try {
        // 1. Fetch users who have filled out a form
        const usersRes = await pool.query('SELECT * FROM users WHERE form_id IS NOT NULL');
        const users = usersRes.rows;

        if (users.length < 2) {
            console.log('Not enough users to generate matches.');
            return;
        }

        // 2. Clear old matches (all of them for a fresh start each week)
        // Using a transaction to ensure integrity
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete all existing matches
            await client.query('DELETE FROM matches');

            // 3. Generate matches
            const matches = matchingAlgorithm.generateMatches(users);
            console.log(`Generated ${matches.length} matches.`);

            // 4. Save new matches
            for (const [user1, user2] of matches) {
                await client.query(
                    'INSERT INTO matches (user_id_1, user_id_2) VALUES ($1, $2)',
                    [user1.id, user2.id]
                );
            }

            await client.query('COMMIT');
            console.log('Weekly matching job completed successfully.');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error('Error during weekly matching job transaction:', e);
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error in weekly matching job:', err);
    }
}, {
    scheduled: false // Don't start automatically; we'll start it in server.js
});

module.exports = weeklyMatchJob;
