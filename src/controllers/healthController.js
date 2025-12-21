class HealthController {
    checkHealth(req, res) {
        res.status(200).json({ status: 'OK' });
    }
}

module.exports = HealthController;