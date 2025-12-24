const { pool } = require('../config/db');

class HealthController {
    async checkHealth(req, res) {
        try {
            // Test database connection
            const dbResult = await pool.query('SELECT NOW() as current_time, version() as db_version');
            
            res.status(200).json({ 
                status: 'OK',
                database: {
                    connected: true,
                    currentTime: dbResult.rows[0].current_time,
                    version: dbResult.rows[0].db_version.split(' ')[0] + ' ' + dbResult.rows[0].db_version.split(' ')[1] // PostgreSQL version
                }
            });
        } catch (err) {
            res.status(503).json({ 
                status: 'ERROR',
                database: {
                    connected: false,
                    error: err.message
                }
            });
        }
    }
}

module.exports = HealthController;