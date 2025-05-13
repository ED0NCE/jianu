const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('review', {
    review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    travel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.ENUM('approve', 'reject'),
        allowNull: false,
    },
    rejection_reason: {
        type: DataTypes.TEXT,
    },
    review_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Review;