const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: '验证失败',
            details: err.details.map(detail => detail.message),
        });
    }

    res.status(500).json({ message: '服务器错误' });
};

module.exports = errorHandler;