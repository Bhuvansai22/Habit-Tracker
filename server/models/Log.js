const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true,
    },
    date: {
        type: String,   // "YYYY-MM-DD" format for easy querying
        required: true,
    },
    completed: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Unique: one log per habit per day per user
logSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Log', logSchema);
