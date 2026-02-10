const errorHandler = (err, req, res, next) => {
    console.error('Global Error Handler:', err.message);
    console.error(err.stack);
    res.status(500).json({
        message: 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = errorHandler;