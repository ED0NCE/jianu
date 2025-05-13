const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Travel = sequelize.define('travel', {
    travel_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'),
        allowNull: false,
        defaultValue: 'draft',
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    participants: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    expenditure: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    video_url: {
        type: DataTypes.STRING(255),
    },
    rejection_reason: {
        type: DataTypes.TEXT,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
});

module.exports = Travel;