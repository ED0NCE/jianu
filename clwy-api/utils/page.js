const getPaginatedResults = async (model, req) => {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' } = req.query;

    const offset = (page - 1) * limit;
    const results = await model.findAndCountAll({
        order: [[sortBy, order]],
        offset,
        limit,
    });

    return {
        data: results.rows,
        page,
        limit,
        total: results.count,
        pages: Math.ceil(results.count / limit),
    };
};

module.exports = { getPaginatedResults };