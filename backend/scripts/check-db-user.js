const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query('SELECT id, name, user_photo_key FROM users WHERE id = 1');
        const user = res.rows[0];
        console.log('User 1:', user.name);
        console.log('Key:', user.user_photo_key);
        if (user.user_photo_key) {
            const prefix = process.env.S3_KEY_PREFIX || 'ouzp99cxbwpv/';
            const doublePrefix = prefix + prefix;
            // remove trailing slash from prefix if needed for check? no S3_KEY_PREFIX usually has trailing slash
            // If S3_KEY_PREFIX is 'folder/', double is 'folder/folder/'
            if (user.user_photo_key.startsWith('ouzp99cxbwpv/ouzp99cxbwpv/')) {
                console.log('Double prefix DETECTED!');
            } else {
                console.log('Prefix looks OK (single).');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
